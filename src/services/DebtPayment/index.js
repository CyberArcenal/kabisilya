// services/debtPayment/index.js
//@ts-check

const { paginateQueryBuilder } = require("../../utils/dbUtils/pagination");
const auditLogger = require("../../utils/auditLogger");
const { logger } = require("../../utils/logger");
const { buildDebtPaymentQuery } = require("./queries");
const createFromPaymentFn = require("./createFromPayment");
const createDirectFn = require("./createDirect");

class DebtPaymentService {
  constructor() {
    this.debtPaymentRepository = null;
    this.debtRepository = null;
    this.paymentRepository = null;
  }

  async initialize() {
    const { AppDataSource } = require("../../main/db/data-source");
    const DebtPayment = require("../../entities/DebtPayment");
    const Debt = require("../../entities/Debt");
    const Payment = require("../../entities/Payment");

    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    this.debtPaymentRepository = AppDataSource.getRepository(DebtPayment);
    this.debtRepository = AppDataSource.getRepository(Debt);
    this.paymentRepository = AppDataSource.getRepository(Payment);
    logger.info("DebtPaymentService initialized");
  }

  async getRepositories() {
    if (!this.debtPaymentRepository) {
      await this.initialize();
    }
    return {
      debtPayment: this.debtPaymentRepository,
      debt: this.debtRepository,
      payment: this.paymentRepository,
    };
  }

  /**
   * Helper: get repository (transactional if queryRunner provided)
   */
  _getRepo(qr, entityClass) {
    const qrType = qr === null ? "null" : qr === undefined ? "undefined" : typeof qr;
    const hasManager = qr && typeof qr === "object" && !!qr.manager;

    if (hasManager && typeof qr.manager.getRepository === "function") {
      return qr.manager.getRepository(entityClass);
    }
    const { AppDataSource } = require("../../main/db/data-source");
    return AppDataSource.getRepository(entityClass);
  }

  // ============================================================
  // 📝 CREATE
  // ============================================================

  /**
   * Create DebtPayment from Payment (salary deduction)
   */
  async createFromPayment(data, user = "system", qr = null) {
    const deps = {
      debtPaymentRepo: this._getRepo(qr, require("../../entities/DebtPayment")),
      debtRepo: this._getRepo(qr, require("../../entities/Debt")),
      paymentRepo: this._getRepo(qr, require("../../entities/Payment")),
      saveDb: require("../../utils/dbUtils/dbActions").saveDb,
    };
    return createFromPaymentFn(deps, data, user, qr);
  }

  /**
   * Create DebtPayment without Payment (direct payment)
   */
  async createDirect(data, user = "system", qr = null) {
    const deps = {
      debtPaymentRepo: this._getRepo(qr, require("../../entities/DebtPayment")),
      debtRepo: this._getRepo(qr, require("../../entities/Debt")),
      saveDb: require("../../utils/dbUtils/dbActions").saveDb,
    };
    return createDirectFn(deps, data, user, qr);
  }

  /**
   * Alias for createFromPayment (backward compatibility)
   */
  async create(data, user = "system", qr = null) {
    if (data.paymentId) {
      return this.createFromPayment(data, user, qr);
    }
    return this.createDirect(data, user, qr);
  }

  // ============================================================
  // 🔍 READ
  // ============================================================

  async findById(id, includeDeleted = false) {
    const { debtPayment: repo } = await this.getRepositories();
    const qb = buildDebtPaymentQuery(repo, {}, includeDeleted);
    qb.andWhere("debtPayment.id = :id", { id });

    const result = await qb.getOne();
    if (!result) {
      throw new Error(`DebtPayment with ID ${id} not found`);
    }
    await auditLogger.logView("DebtPayment", id, "system");
    return result;
  }

  async findAll(options = {}) {
    const { debtPayment: repo } = await this.getRepositories();
    const qb = buildDebtPaymentQuery(repo, options, options.includeDeleted);

    const result = await paginateQueryBuilder(qb, {
      page: options.page,
      limit: options.limit,
    });

    await auditLogger.logView("DebtPayment", null, "system");
    return result;
  }

  async findByPaymentId(paymentId, options = {}) {
    return this.findAll({ ...options, paymentId });
  }

  async findByDebtId(debtId, options = {}) {
    return this.findAll({ ...options, debtId });
  }

  async findByWorkerId(workerId, options = {}) {
    return this.findAll({ ...options, workerId });
  }

  // ============================================================
  // 📊 STATISTICS
  // ============================================================

  async getTotalPaidByWorker(workerId) {
    const { debtPayment: repo } = await this.getRepositories();

    const result = await repo
      .createQueryBuilder("debtPayment")
      .leftJoin("debtPayment.payment", "payment")
      .leftJoin("payment.worker", "worker")
      .where("worker.id = :workerId", { workerId })
      .andWhere("debtPayment.deletedAt IS NULL")
      .select("SUM(debtPayment.amount)", "total")
      .getRawOne();

    return parseFloat(result.total) || 0;
  }

  async getTotalPaidByDebt(debtId) {
    const { debtPayment: repo } = await this.getRepositories();

    const result = await repo
      .createQueryBuilder("debtPayment")
      .where("debtPayment.debtId = :debtId", { debtId })
      .andWhere("debtPayment.deletedAt IS NULL")
      .select("SUM(debtPayment.amount)", "total")
      .getRawOne();

    return parseFloat(result.total) || 0;
  }

  // ============================================================
  // 📤 EXPORT
  // ============================================================

  async exportDebtPayments(format = "json", filters = {}, user = "system") {
    const result = await this.findAll(filters);
    const debtPayments = result.data;

    let exportData;
    if (format === "csv") {
      const headers = [
        "ID", "Payment ID", "Debt ID", "Worker Name",
        "Amount", "Previous Balance", "New Balance", "Notes", "Created At",
      ];
      const rows = debtPayments.map((dp) => [
        dp.id,
        dp.payment?.id ?? "",
        dp.debt?.id ?? "",
        dp.payment?.worker?.name ?? "",
        dp.amount,
        dp.previousBalance,
        dp.newBalance,
        dp.notes ?? "",
        new Date(dp.createdAt).toLocaleString(),
      ]);
      exportData = {
        format: "csv",
        data: [headers, ...rows].map((row) => row.join(",")).join("\n"),
        filename: `debt_payments_export_${new Date().toISOString().split("T")[0]}.csv`,
      };
    } else {
      exportData = {
        format: "json",
        data: debtPayments,
        filename: `debt_payments_export_${new Date().toISOString().split("T")[0]}.json`,
      };
    }

    await auditLogger.logExport("DebtPayment", format, filters, user);
    logger.info(`Exported ${debtPayments.length} debt payments in ${format} format`);
    return exportData;
  }

  // ============================================================
  // 🗑️ DELETE
  // ============================================================

  async delete(id, user = "system", qr = null) {
    const { updateDb } = require("../../utils/dbUtils/dbActions");
    const DebtPayment = require("../../entities/DebtPayment");
    const debtPaymentRepo = this._getRepo(qr, DebtPayment);

    const debtPayment = await debtPaymentRepo.findOne({
      where: { id, deletedAt: null },
    });
    if (!debtPayment) {
      throw new Error(`DebtPayment with ID ${id} not found`);
    }

    const oldData = { ...debtPayment };
    debtPayment.deletedAt = new Date();

    const saved = await updateDb(debtPaymentRepo, debtPayment, {
      queryRunner: qr,
    });
    await auditLogger.logDelete("DebtPayment", id, oldData, user);
    logger.info(`DebtPayment soft deleted: #${id}`);
    return saved;
  }

  async restore(id, user = "system", qr = null) {
    const { updateDb } = require("../../utils/dbUtils/dbActions");
    const DebtPayment = require("../../entities/DebtPayment");
    const debtPaymentRepo = this._getRepo(qr, DebtPayment);

    const debtPayment = await debtPaymentRepo.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!debtPayment) {
      throw new Error(`DebtPayment with ID ${id} not found`);
    }
    if (!debtPayment.deletedAt) {
      throw new Error(`DebtPayment #${id} is not deleted`);
    }

    debtPayment.deletedAt = null;

    const saved = await updateDb(debtPaymentRepo, debtPayment, {
      queryRunner: qr,
    });
    await auditLogger.logUpdate(
      "DebtPayment",
      id,
      { deletedAt: true },
      { deletedAt: null },
      user,
    );
    logger.info(`DebtPayment restored: #${id}`);
    return saved;
  }

  async permanentlyDelete(id, user = "system", qr = null) {
    const { removeDb } = require("../../utils/dbUtils/dbActions");
    const DebtPayment = require("../../entities/DebtPayment");
    const debtPaymentRepo = this._getRepo(qr, DebtPayment);

    const debtPayment = await debtPaymentRepo.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!debtPayment) {
      throw new Error(`DebtPayment with ID ${id} not found`);
    }

    await removeDb(debtPaymentRepo, debtPayment);
    await auditLogger.logDelete("DebtPayment", id, debtPayment, user);
    logger.info(`DebtPayment #${id} permanently deleted`);
  }
}

// Singleton instance
const debtPaymentService = new DebtPaymentService();
module.exports = debtPaymentService;