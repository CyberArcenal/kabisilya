// services/DebtService/index.js
//@ts-check

const { paginateQueryBuilder } = require("../../utils/dbUtils/pagination");
const auditLogger = require("../../utils/auditLogger");
const { logger } = require("../../utils/logger");
const { roundToTwo, getRepo } = require("./utils");
const deductFromWorkerFn = require("./deductFromWorker");
const payDebtFn = require("./payDebt");

class DebtService {
  constructor() {
    this.debtRepository = null;
    this.workerRepository = null;
    this.sessionRepository = null;
    this.debtPaymentService = null;
  }

  async initialize() {
    const { AppDataSource } = require("../../main/db/data-source");
    const Debt = require("../../entities/Debt");
    const Worker = require("../../entities/Worker");
    const Session = require("../../entities/Session");
    const DebtPaymentService = require("../DebtPayment");

    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    this.debtRepository = AppDataSource.getRepository(Debt);
    this.workerRepository = AppDataSource.getRepository(Worker);
    this.sessionRepository = AppDataSource.getRepository(Session);
    this.debtPaymentService = DebtPaymentService;
    logger.info("DebtService initialized");
  }

  async getRepositories() {
    if (!this.debtRepository) {
      await this.initialize();
    }
    return {
      debt: this.debtRepository,
      worker: this.workerRepository,
      session: this.sessionRepository,
    };
  }

  /**
   * Helper: get repository (transactional)
   */
  _getRepo(qr, entityClass) {
    return getRepo(qr, entityClass, null);
  }

  // ============================================================
  // 📝 CREATE
  // ============================================================

  async create(data, user = "system", qr = null) {
    const { saveDb } = require("../../utils/dbUtils/dbActions");
    const Debt = require("../../entities/Debt");
    const Worker = require("../../entities/Worker");
    const Session = require("../../entities/Session");

    const debtRepo = this._getRepo(qr, Debt);
    const workerRepo = this._getRepo(qr, Worker);
    const sessionRepo = this._getRepo(qr, Session);

    if (!data.workerId) throw new Error("workerId is required");
    if (!data.sessionId) throw new Error("sessionId is required");
    if (data.amount === undefined) throw new Error("amount is required");

    const worker = await workerRepo.findOne({ where: { id: data.workerId } });
    if (!worker) throw new Error(`Worker with ID ${data.workerId} not found`);

    const session = await sessionRepo.findOne({
      where: { id: data.sessionId },
    });
    if (!session)
      throw new Error(`Session with ID ${data.sessionId} not found`);

    const debtData = {
      worker,
      session,
      amount: data.amount,
      originalAmount: data.originalAmount || data.amount,
      balance: data.balance || data.amount,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      description: data.description || null,
      status: data.status || "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const debt = debtRepo.create(debtData);
    const saved = await saveDb(debtRepo, debt, { queryRunner: qr });
    await auditLogger.logCreate("Debt", saved.id, saved, user);
    return saved;
  }

  // ============================================================
  // ✏️ UPDATE
  // ============================================================

  async update(id, data, user = "system", qr = null) {
    const { updateDb } = require("../../utils/dbUtils/dbActions");
    const Debt = require("../../entities/Debt");
    const Worker = require("../../entities/Worker");
    const Session = require("../../entities/Session");

    const debtRepo = this._getRepo(qr, Debt);
    const workerRepo = this._getRepo(qr, Worker);
    const sessionRepo = this._getRepo(qr, Session);

    const existing = await debtRepo.findOne({
      where: { id, deletedAt: null },
      relations: ["worker", "session"],
    });
    if (!existing) throw new Error(`Debt with ID ${id} not found`);

    const oldData = { ...existing };

    if (data.workerId !== undefined) {
      const worker = await workerRepo.findOne({ where: { id: data.workerId } });
      if (!worker) throw new Error(`Worker with ID ${data.workerId} not found`);
      existing.worker = worker;
      delete data.workerId;
    }
    if (data.sessionId !== undefined) {
      const session = await sessionRepo.findOne({
        where: { id: data.sessionId },
      });
      if (!session)
        throw new Error(`Session with ID ${data.sessionId} not found`);
      existing.session = session;
      delete data.sessionId;
    }
    if (data.dueDate) {
      data.dueDate = new Date(data.dueDate);
    }

    Object.assign(existing, data);
    existing.updatedAt = new Date();

    const saved = await updateDb(debtRepo, existing, { queryRunner: qr });
    await auditLogger.logUpdate("Debt", id, oldData, saved, user);
    return saved;
  }

  // ============================================================
  // 🗑️ DELETE
  // ============================================================

  async delete(id, user = "system", qr = null) {
    const { updateDb } = require("../../utils/dbUtils/dbActions");
    const Debt = require("../../entities/Debt");
    const debtRepo = this._getRepo(qr, Debt);

    const debt = await debtRepo.findOne({ where: { id, deletedAt: null } });
    if (!debt) throw new Error(`Debt with ID ${id} not found`);
    if (debt.deletedAt) throw new Error(`Debt #${id} is already deleted`);

    const oldData = { ...debt };
    debt.deletedAt = new Date();
    debt.updatedAt = new Date();

    const saved = await updateDb(debtRepo, debt, { queryRunner: qr });
    await auditLogger.logDelete("Debt", id, oldData, user);
    logger.info(`Debt soft deleted: #${id}`);
    return saved;
  }

  async restore(id, user = "system", qr = null) {
    const { updateDb } = require("../../utils/dbUtils/dbActions");
    const Debt = require("../../entities/Debt");
    const debtRepo = this._getRepo(qr, Debt);

    const debt = await debtRepo.findOne({ where: { id }, withDeleted: true });
    if (!debt) throw new Error(`Debt with ID ${id} not found`);
    if (!debt.deletedAt) throw new Error(`Debt #${id} is not deleted`);

    debt.deletedAt = null;
    debt.updatedAt = new Date();

    const saved = await updateDb(debtRepo, debt, { queryRunner: qr });
    await auditLogger.logUpdate(
      "Debt",
      id,
      { deletedAt: true },
      { deletedAt: null },
      user,
    );
    logger.info(`Debt restored: #${id}`);
    return saved;
  }

  async permanentlyDelete(id, user = "system", qr = null) {
    const { removeDb } = require("../../utils/dbUtils/dbActions");
    const Debt = require("../../entities/Debt");
    const debtRepo = this._getRepo(qr, Debt);

    const debt = await debtRepo.findOne({ where: { id }, withDeleted: true });
    if (!debt) throw new Error(`Debt with ID ${id} not found`);

    await removeDb(debtRepo, debt);
    await auditLogger.logDelete("Debt", id, debt, user);
    logger.info(`Debt #${id} permanently deleted`);
  }

  // ============================================================
  // 🔍 FIND
  // ============================================================

  async findById(id, includeDeleted = false) {
    const { debt: repo } = await this.getRepositories();

    const qb = repo
      .createQueryBuilder("debt")
      .leftJoinAndSelect("debt.worker", "worker")
      .leftJoinAndSelect("debt.session", "session")
      .leftJoinAndSelect("debt.history", "history")
      .leftJoinAndSelect("debt.debtPayments", "debtPayments")
      .where("debt.id = :id", { id });

    if (!includeDeleted) {
      qb.andWhere("debt.deletedAt IS NULL");
    }

    const debt = await qb.getOne();
    if (!debt) throw new Error(`Debt with ID ${id} not found`);

    await auditLogger.logView("Debt", id, "system");
    return debt;
  }

  async findAll(options = {}) {
    const { debt: repo } = await this.getRepositories();

    const qb = repo
      .createQueryBuilder("debt")
      .leftJoinAndSelect("debt.worker", "worker")
      .leftJoinAndSelect("debt.session", "session")
      .leftJoinAndSelect("debt.debtPayments", "debtPayments");

    if (!options.includeDeleted) {
      qb.andWhere("debt.deletedAt IS NULL");
    }

    if (options.workerId) {
      qb.andWhere("worker.id = :workerId", { workerId: options.workerId });
    }
    if (options.sessionId) {
      qb.andWhere("session.id = :sessionId", { sessionId: options.sessionId });
    }
    if (options.status) {
      qb.andWhere("debt.status = :status", { status: options.status });
    }
    if (options.dueDateStart) {
      qb.andWhere("debt.dueDate >= :dueDateStart", {
        dueDateStart: new Date(options.dueDateStart),
      });
    }
    if (options.dueDateEnd) {
      qb.andWhere("debt.dueDate <= :dueDateEnd", {
        dueDateEnd: new Date(options.dueDateEnd),
      });
    }
    if (options.minAmount) {
      qb.andWhere("debt.amount >= :minAmount", {
        minAmount: options.minAmount,
      });
    }
    if (options.maxAmount) {
      qb.andWhere("debt.amount <= :maxAmount", {
        maxAmount: options.maxAmount,
      });
    }
    if (options.search) {
      qb.andWhere("(debt.reason LIKE :search OR worker.name LIKE :search)", {
        search: `%${options.search}%`,
      });
    }

    const sortMap = {
      amount: "debt.amount",
      balance: "debt.balance",
      dueDate: "debt.dueDate",
      status: "debt.status",
      interestRate: "debt.interestRate",
      createdAt: "debt.createdAt",
      lastPaymentDate: "debt.lastPaymentDate",
      workerName: "worker.name",
    };
    let sortBy =
      options.sortBy && sortMap[options.sortBy]
        ? sortMap[options.sortBy]
        : "debt.dueDate";
    let sortOrder = options.sortOrder === "ASC" ? "ASC" : "DESC";
    qb.orderBy(sortBy, sortOrder);

    const result = await paginateQueryBuilder(qb, {
      page: options.page,
      limit: options.limit,
    });

    await auditLogger.logView("Debt", null, "system");
    return result;
  }

  // ============================================================
  // 📊 STATISTICS
  // ============================================================

  async getStatistics() {
    const { debt: repo } = await this.getRepositories();
    const qb = repo.createQueryBuilder("debt").where("debt.deletedAt IS NULL");

    const total = await qb.getCount();
    const pending = await qb
      .clone()
      .andWhere("debt.status = :status", { status: "pending" })
      .getCount();
    const partiallyPaid = await qb
      .clone()
      .andWhere("debt.status = :status", { status: "partially_paid" })
      .getCount();
    const paid = await qb
      .clone()
      .andWhere("debt.status = :status", { status: "paid" })
      .getCount();
    const overdue = await qb
      .clone()
      .andWhere("debt.status = :status", { status: "overdue" })
      .getCount();
    const cancelled = await qb
      .clone()
      .andWhere("debt.status = :status", { status: "cancelled" })
      .getCount();

    const totalAmountSum = await qb
      .clone()
      .select("SUM(debt.amount)", "sum")
      .getRawOne();
    const totalAmount = parseFloat(totalAmountSum.sum) || 0;
    const totalBalanceSum = await qb
      .clone()
      .select("SUM(debt.balance)", "sum")
      .getRawOne();
    const totalBalance = parseFloat(totalBalanceSum.sum) || 0;

    return {
      total,
      pending,
      partiallyPaid,
      paid,
      overdue,
      cancelled,
      totalAmount,
      totalBalance,
    };
  }

  async getStatisticsWithFilters(options = {}) {
    const { debt: repo } = await this.getRepositories();
    const qb = repo
      .createQueryBuilder("debt")
      .leftJoin("debt.worker", "worker")
      .where("debt.deletedAt IS NULL");

    if (options.workerId)
      qb.andWhere("worker.id = :workerId", { workerId: options.workerId });
    if (options.sessionId)
      qb.andWhere("debt.sessionId = :sessionId", {
        sessionId: options.sessionId,
      });
    if (options.status)
      qb.andWhere("debt.status = :status", { status: options.status });
    if (options.dueDateStart)
      qb.andWhere("debt.dueDate >= :dueDateStart", {
        dueDateStart: new Date(options.dueDateStart),
      });
    if (options.dueDateEnd)
      qb.andWhere("debt.dueDate <= :dueDateEnd", {
        dueDateEnd: new Date(options.dueDateEnd),
      });
    if (options.minAmount)
      qb.andWhere("debt.amount >= :minAmount", {
        minAmount: options.minAmount,
      });
    if (options.maxAmount)
      qb.andWhere("debt.amount <= :maxAmount", {
        maxAmount: options.maxAmount,
      });
    if (options.search) {
      qb.andWhere("(debt.reason LIKE :search OR worker.name LIKE :search)", {
        search: `%${options.search}%`,
      });
    }

    const totalDebts = await qb.getCount();
    const totalAmountResult = await qb
      .clone()
      .select("SUM(debt.amount)", "totalAmount")
      .getRawOne();
    const totalBalanceResult = await qb
      .clone()
      .select("SUM(debt.balance)", "totalBalance")
      .getRawOne();
    const overdueCount = await qb
      .clone()
      .andWhere(
        "debt.dueDate < :today AND debt.balance > 0 AND debt.status NOT IN (:...excludedStatuses)",
        {
          today: new Date(),
          excludedStatuses: ["paid", "cancelled", "settled"],
        },
      )
      .getCount();
    const avgInterestResult = await qb
      .clone()
      .select("AVG(debt.interestRate)", "avgInterest")
      .getRawOne();
    const averageInterest = parseFloat(avgInterestResult.avgInterest) || 0;

    return {
      totalDebts,
      totalAmount: parseFloat(totalAmountResult.totalAmount) || 0,
      totalBalance: parseFloat(totalBalanceResult.totalBalance) || 0,
      overdueCount,
      averageInterest,
    };
  }

  // ============================================================
  // 📦 BULK & IMPORT
  // ============================================================

  async bulkCreate(debtsArray, user = "system", qr = null) {
    const results = { created: [], errors: [] };
    for (const data of debtsArray) {
      try {
        const saved = await this.create(data, user, qr);
        results.created.push(saved);
      } catch (err) {
        results.errors.push({ debt: data, error: err.message });
      }
    }
    return results;
  }

  async bulkUpdate(updatesArray, user = "system", qr = null) {
    const results = { updated: [], errors: [] };
    for (const { id, updates } of updatesArray) {
      try {
        const saved = await this.update(id, updates, user, qr);
        results.updated.push(saved);
      } catch (err) {
        results.errors.push({ id, updates, error: err.message });
      }
    }
    return results;
  }

  async importFromCSV(filePath, user = "system", qr = null) {
    const fs = require("fs").promises;
    const csv = require("csv-parse/sync");
    const fileContent = await fs.readFile(filePath, "utf-8");
    const records = csv.parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    const results = { imported: [], errors: [] };
    for (const record of records) {
      try {
        const debtData = {
          workerId: parseInt(record.workerId, 10),
          sessionId: parseInt(record.sessionId, 10),
          amount: parseFloat(record.amount),
          originalAmount: record.originalAmount
            ? parseFloat(record.originalAmount)
            : undefined,
          balance: record.balance ? parseFloat(record.balance) : undefined,
          dueDate: record.dueDate || null,
          description: record.description || null,
          status: record.status || "pending",
        };
        if (!debtData.workerId) throw new Error("workerId is required");
        if (!debtData.sessionId) throw new Error("sessionId is required");
        if (isNaN(debtData.amount)) throw new Error("amount must be a number");
        const saved = await this.create(debtData, user, qr);
        results.imported.push(saved);
      } catch (err) {
        results.errors.push({ row: record, error: err.message });
      }
    }
    return results;
  }

  // ============================================================
  // 📤 EXPORT
  // ============================================================

  async exportDebts(format = "json", filters = {}, user = "system") {
    const result = await this.findAll(filters);
    const debts = result.data;

    let exportData;
    if (format === "csv") {
      const headers = [
        "ID",
        "Worker ID",
        "Worker Name",
        "Session ID",
        "Amount",
        "Original Amount",
        "Balance",
        "Due Date",
        "Description",
        "Status",
        "Created At",
        "Updated At",
      ];
      const rows = debts.map((d) => [
        d.id,
        d.worker?.id ?? "",
        d.worker?.name ?? "",
        d.session?.id ?? "",
        d.amount,
        d.originalAmount,
        d.balance,
        d.dueDate ? new Date(d.dueDate).toLocaleDateString() : "",
        d.description ?? "",
        d.status,
        new Date(d.createdAt).toLocaleDateString(),
        new Date(d.updatedAt).toLocaleDateString(),
      ]);
      exportData = {
        format: "csv",
        data: [headers, ...rows].map((row) => row.join(",")).join("\n"),
        filename: `debts_export_${new Date().toISOString().split("T")[0]}.csv`,
      };
    } else {
      exportData = {
        format: "json",
        data: debts,
        filename: `debts_export_${new Date().toISOString().split("T")[0]}.json`,
      };
    }

    await auditLogger.logExport("Debt", format, filters, user);
    logger.info(`Exported ${debts.length} debts in ${format} format`);
    return exportData;
  }

  // ============================================================
  // 🎯 CRITICAL OPERATIONS (Extracted)
  // ============================================================

  async deductFromWorker(
    workerId,
    amount,
    paymentId,
    sessionId,
    user = "system",
    qr = null,
  ) {
    const deps = {
      debtRepo: this._getRepo(qr, require("../../entities/Debt")),
      historyRepo: this._getRepo(qr, require("../../entities/DebtHistory")),
      paymentRepo: this._getRepo(qr, require("../../entities/Payment")),
      debtPaymentService: this.debtPaymentService,
      updateDb: require("../../utils/dbUtils/dbActions").updateDb,
      saveDb: require("../../utils/dbUtils/dbActions").saveDb,
    };
    // Ensure debtPaymentService is initialized
    if (!this.debtPaymentService) {
      await this.initialize();
    }
    return deductFromWorkerFn(
      deps,
      workerId,
      amount,
      paymentId,
      sessionId,
      user,
      qr,
    );
  }

  async payDebt(
    id,
    amount,
    user = "system",
    qr = null,
    paymentMethod = null,
    referenceNumber = null,
    notes = null,
  ) {
    const deps = {
      debtRepo: this._getRepo(qr, require("../../entities/Debt")),
      historyRepo: this._getRepo(qr, require("../../entities/DebtHistory")),
      updateDb: require("../../utils/dbUtils/dbActions").updateDb,
      saveDb: require("../../utils/dbUtils/dbActions").saveDb,
    };
    return payDebtFn(
      deps,
      id,
      amount,
      user,
      qr,
      paymentMethod,
      referenceNumber,
      notes,
    );
  }
}

// Singleton instance
const debtService = new DebtService();
module.exports = debtService;
