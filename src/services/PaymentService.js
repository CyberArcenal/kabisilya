// services/PaymentService.js
// Refactored to follow the same structure as DebtService, AssignmentService, etc.
//@ts-check
const auditLogger = require("../utils/auditLogger");
const { paginateQueryBuilder } = require("../utils/dbUtils/pagination");
const { farmSessionDefaultSessionId } = require("../utils/settings/system");

class PaymentService {
  constructor() {
    this.paymentRepository = null;
    this.workerRepository = null;
    this.pitakRepository = null;
    this.sessionRepository = null;
    this.assignmentRepository = null;
  }

  async initialize() {
    const { AppDataSource } = require("../main/db/data-source");
    const Payment = require("../entities/Payment");
    const Worker = require("../entities/Worker");
    const Pitak = require("../entities/Pitak");
    const Session = require("../entities/Session");
    const Assignment = require("../entities/Assignment");

    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    this.paymentRepository = AppDataSource.getRepository(Payment);
    this.workerRepository = AppDataSource.getRepository(Worker);
    this.pitakRepository = AppDataSource.getRepository(Pitak);
    this.sessionRepository = AppDataSource.getRepository(Session);
    this.assignmentRepository = AppDataSource.getRepository(Assignment);
    console.log("PaymentService initialized");
  }

  async getRepositories() {
    if (!this.paymentRepository) {
      await this.initialize();
    }
    return {
      payment: this.paymentRepository,
      worker: this.workerRepository,
      pitak: this.pitakRepository,
      session: this.sessionRepository,
      assignment: this.assignmentRepository,
    };
  }

  /**
   * Helper: get repository (transactional if queryRunner provided)
   * @param {import("typeorm").QueryRunner | null} qr
   * @param {Function} entityClass
   * @returns {import("typeorm").Repository<any>}
   */
  _getRepo(qr, entityClass) {
    const qrType =
      qr === null ? "null" : qr === undefined ? "undefined" : typeof qr;
    const hasManager = qr && typeof qr === "object" && !!qr.manager;
    console.log(
      `[Payment._getRepo] qr type: ${qrType}, has manager: ${hasManager}`,
    );

    if (hasManager && typeof qr.manager.getRepository === "function") {
      return qr.manager.getRepository(entityClass);
    }
    const { AppDataSource } = require("../main/db/data-source");
    console.log(`[Payment._getRepo] Using global repository (fallback)`);
    return AppDataSource.getRepository(entityClass);
  }

  /**
   * Create a new payment
   * @param {Object} data - { workerId, pitakId, sessionId, assignmentId?, amount, paymentDate?, description?, status?, idempotencyKey? }
   * @param {string} user
   * @param {import("typeorm").QueryRunner | null} qr
   */
  async create(data, user = "system", qr = null) {
    const { saveDb } = require("../utils/dbUtils/dbActions");
    const Payment = require("../entities/Payment");
    const Worker = require("../entities/Worker");
    const Pitak = require("../entities/Pitak");
    const Session = require("../entities/Session");
    const Assignment = require("../entities/Assignment");

    const paymentRepo = this._getRepo(qr, Payment);
    const workerRepo = this._getRepo(qr, Worker);
    const pitakRepo = this._getRepo(qr, Pitak);
    const sessionRepo = this._getRepo(qr, Session);
    const assignmentRepo = this._getRepo(qr, Assignment);

    try {
      if (!data.workerId) throw new Error("workerId is required");
      if (!data.pitakId) throw new Error("pitakId is required");
      if (!data.sessionId) throw new Error("sessionId is required");
      if (data.amount === undefined) throw new Error("amount is required");

      const worker = await workerRepo.findOne({
        where: { id: data.workerId, deletedAt: null },
      });
      if (!worker) throw new Error(`Worker with ID ${data.workerId} not found`);

      const pitak = await pitakRepo.findOne({
        where: { id: data.pitakId, deletedAt: null },
      });
      if (!pitak) throw new Error(`Pitak with ID ${data.pitakId} not found`);

      const session = await sessionRepo.findOne({
        where: { id: data.sessionId, deletedAt: null },
      });
      if (!session)
        throw new Error(`Session with ID ${data.sessionId} not found`);

      let assignment = null;
      if (data.assignmentId) {
        assignment = await assignmentRepo.findOne({
          where: { id: data.assignmentId, deletedAt: null },
        });
        if (!assignment)
          throw new Error(`Assignment with ID ${data.assignmentId} not found`);
      }

      // Check uniqueness of (worker, pitak, session) – only one active payment per combination
      const existing = await paymentRepo.findOne({
        where: {
          worker: { id: data.workerId },
          pitak: { id: data.pitakId },
          session: { id: data.sessionId },
          deletedAt: null,
        },
      });
      if (existing) {
        throw new Error(
          "A payment already exists for this worker, pitak, and session combination",
        );
      }

      // If assignmentId provided, ensure it's not linked to another active payment
      if (data.assignmentId) {
        const existingByAssignment = await paymentRepo.findOne({
          where: { assignment: { id: data.assignmentId }, deletedAt: null },
        });
        if (existingByAssignment) {
          throw new Error(
            `Assignment ID ${data.assignmentId} is already linked to another payment`,
          );
        }
      }

      // Idempotency key uniqueness (if provided)
      if (data.idempotencyKey) {
        const existingKey = await paymentRepo.findOne({
          where: { idempotencyKey: data.idempotencyKey, deletedAt: null },
        });
        if (existingKey) {
          throw new Error(
            `Idempotency key "${data.idempotencyKey}" already exists`,
          );
        }
      }

      const paymentData = {
        worker,
        pitak,
        session,
        assignment,
        amount: data.amount,
        grossPay: data.grossPay ?? data.amount, // fallback to amount if not provided
        netPay: data.netPay ?? data.amount, // fallback to amount if not provided
        paymentDate: data.paymentDate ? new Date(data.paymentDate) : new Date(),
        description: data.description || null,
        status: data.status || "pending",
        idempotencyKey: data.idempotencyKey || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const payment = paymentRepo.create(paymentData);
      const saved = await saveDb(paymentRepo, payment, { queryRunner: qr });
      await auditLogger.logCreate("Payment", saved.id, saved, user);
      return saved;
    } catch (error) {
      console.error("Failed to create payment:", error.message);
      throw error;
    }
  }

  /**
   * Update an existing payment
   * @param {number} id
   * @param {Object} data
   * @param {string} user
   * @param {import("typeorm").QueryRunner | null} qr
   */
  async update(id, data, user = "system", qr = null) {
    const { updateDb } = require("../utils/dbUtils/dbActions");
    const Payment = require("../entities/Payment");
    const Worker = require("../entities/Worker");
    const Pitak = require("../entities/Pitak");
    const Session = require("../entities/Session");
    const Assignment = require("../entities/Assignment");

    const paymentRepo = this._getRepo(qr, Payment);
    const workerRepo = this._getRepo(qr, Worker);
    const pitakRepo = this._getRepo(qr, Pitak);
    const sessionRepo = this._getRepo(qr, Session);
    const assignmentRepo = this._getRepo(qr, Assignment);

    try {
      const existing = await paymentRepo.findOne({
        where: { id, deletedAt: null },
        relations: ["worker", "pitak", "session", "assignment"],
      });
      if (!existing) throw new Error(`Payment with ID ${id} not found`);

      const oldData = { ...existing };

      // Handle relation changes
      if (data.workerId !== undefined) {
        const worker = await workerRepo.findOne({
          where: { id: data.workerId, deletedAt: null },
        });
        if (!worker)
          throw new Error(`Worker with ID ${data.workerId} not found`);
        existing.worker = worker;
        delete data.workerId;
      }
      if (data.pitakId !== undefined) {
        const pitak = await pitakRepo.findOne({
          where: { id: data.pitakId, deletedAt: null },
        });
        if (!pitak) throw new Error(`Pitak with ID ${data.pitakId} not found`);
        existing.pitak = pitak;
        delete data.pitakId;
      }
      if (data.sessionId !== undefined) {
        const session = await sessionRepo.findOne({
          where: { id: data.sessionId, deletedAt: null },
        });
        if (!session)
          throw new Error(`Session with ID ${data.sessionId} not found`);
        existing.session = session;
        delete data.sessionId;
      }
      if (data.assignmentId !== undefined) {
        if (data.assignmentId === null) {
          existing.assignment = null;
        } else {
          const assignment = await assignmentRepo.findOne({
            where: { id: data.assignmentId, deletedAt: null },
          });
          if (!assignment)
            throw new Error(
              `Assignment with ID ${data.assignmentId} not found`,
            );
          existing.assignment = assignment;
        }
        delete data.assignmentId;
      }
      if (data.paymentDate) {
        data.paymentDate = new Date(data.paymentDate);
      }

      // Re-check uniqueness if critical fields changed
      if (
        (data.workerId !== undefined ||
          data.pitakId !== undefined ||
          data.sessionId !== undefined) &&
        existing.worker &&
        existing.pitak &&
        existing.session
      ) {
        const duplicate = await paymentRepo.findOne({
          where: {
            worker: { id: existing.worker.id },
            pitak: { id: existing.pitak.id },
            session: { id: existing.session.id },
            deletedAt: null,
          },
        });
        if (duplicate && duplicate.id !== id) {
          throw new Error(
            "Another payment already exists for this worker, pitak, and session combination",
          );
        }
      }

      // If assignment changed, check its uniqueness
      if (data.assignmentId !== undefined && existing.assignment) {
        const duplicateAssignment = await paymentRepo.findOne({
          where: {
            assignment: { id: existing.assignment.id },
            deletedAt: null,
          },
        });
        if (duplicateAssignment && duplicateAssignment.id !== id) {
          throw new Error(
            `Assignment ID ${existing.assignment.id} is already linked to another payment`,
          );
        }
      }

      // Idempotency key uniqueness if changed
      if (
        data.idempotencyKey &&
        data.idempotencyKey !== existing.idempotencyKey
      ) {
        const keyExists = await paymentRepo.findOne({
          where: { idempotencyKey: data.idempotencyKey, deletedAt: null },
        });
        if (keyExists) {
          throw new Error(
            `Idempotency key "${data.idempotencyKey}" already exists`,
          );
        }
      }

      Object.assign(existing, data);
      existing.updatedAt = new Date();

      const saved = await updateDb(paymentRepo, existing, { queryRunner: qr });
      await auditLogger.logUpdate("Payment", id, oldData, saved, user);
      return saved;
    } catch (error) {
      console.error("Failed to update payment:", error.message);
      throw error;
    }
  }

  /**
   * Update payment status with validation of allowed transitions
   * @param {number} id
   * @param {string} newStatus
   * @param {string} user
   * @param {import("typeorm").QueryRunner | null} qr
   */
  async updateStatus(id, newStatus, user = "system", qr = null) {
    const { updateDb } = require("../utils/dbUtils/dbActions");
    const Payment = require("../entities/Payment");
    const paymentRepo = this._getRepo(qr, Payment);

    const payment = await paymentRepo.findOne({
      where: { id, deletedAt: null },
    });
    if (!payment) throw new Error(`Payment with ID ${id} not found`);

    const oldStatus = payment.status;
    if (oldStatus === newStatus) return payment;

    const allowedTransitions = {
      pending: ["partially_paid", "completed", "cancelled"],
      partially_paid: ["completed", "cancelled"],
      completed: [],
      cancelled: [],
    };

    if (!allowedTransitions[oldStatus]?.includes(newStatus)) {
      throw new Error(
        `Invalid status transition from ${oldStatus} to ${newStatus}`,
      );
    }

    payment.status = newStatus;
    payment.updatedAt = new Date();

    const saved = await updateDb(paymentRepo, payment, { queryRunner: qr });
    await auditLogger.logUpdate(
      "Payment",
      id,
      { status: oldStatus },
      { status: newStatus },
      user,
    );
    return saved;
  }

  /**
   * Soft delete a payment (set deletedAt)
   * @param {number} id
   * @param {string} user
   * @param {import("typeorm").QueryRunner | null} qr
   */
  async delete(id, user = "system", qr = null) {
    const { updateDb } = require("../utils/dbUtils/dbActions");
    const Payment = require("../entities/Payment");
    const paymentRepo = this._getRepo(qr, Payment);

    try {
      const payment = await paymentRepo.findOne({
        where: { id, deletedAt: null },
      });
      if (!payment) throw new Error(`Payment with ID ${id} not found`);
      if (payment.deletedAt)
        throw new Error(`Payment #${id} is already deleted`);

      const oldData = { ...payment };
      payment.deletedAt = new Date();
      payment.updatedAt = new Date();

      const saved = await updateDb(paymentRepo, payment, { queryRunner: qr });
      await auditLogger.logDelete("Payment", id, oldData, user);
      console.log(`Payment soft deleted: #${id}`);
      return saved;
    } catch (error) {
      console.error("Failed to delete payment:", error.message);
      throw error;
    }
  }

  /**
   * Restore a soft-deleted payment
   * @param {number} id
   * @param {string} user
   * @param {import("typeorm").QueryRunner | null} qr
   */
  async restore(id, user = "system", qr = null) {
    const { updateDb } = require("../utils/dbUtils/dbActions");
    const Payment = require("../entities/Payment");
    const paymentRepo = this._getRepo(qr, Payment);

    try {
      const payment = await paymentRepo.findOne({
        where: { id },
        withDeleted: true,
      });
      if (!payment) throw new Error(`Payment with ID ${id} not found`);
      if (!payment.deletedAt) throw new Error(`Payment #${id} is not deleted`);

      payment.deletedAt = null;
      payment.updatedAt = new Date();

      const saved = await updateDb(paymentRepo, payment, { queryRunner: qr });
      await auditLogger.logUpdate(
        "Payment",
        id,
        { deletedAt: true },
        { deletedAt: null },
        user,
      );
      console.log(`Payment restored: #${id}`);
      return saved;
    } catch (error) {
      console.error("Failed to restore payment:", error.message);
      throw error;
    }
  }

  /**
   * Permanently delete a payment (hard delete) – use with caution
   * @param {number} id
   * @param {string} user
   * @param {import("typeorm").QueryRunner | null} qr
   */
  async permanentlyDelete(id, user = "system", qr = null) {
    const { removeDb } = require("../utils/dbUtils/dbActions");
    const Payment = require("../entities/Payment");
    const paymentRepo = this._getRepo(qr, Payment);

    const payment = await paymentRepo.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!payment) throw new Error(`Payment with ID ${id} not found`);

    await removeDb(paymentRepo, payment);
    await auditLogger.logDelete("Payment", id, payment, user);
    console.log(`Payment #${id} permanently deleted`);
  }

  /**
   * Find payment by ID (excludes soft-deleted by default)
   * @param {number} id
   * @param {boolean} includeDeleted
   */
  async findById(id, includeDeleted = false) {
    const { payment: repo } = await this.getRepositories();

    const qb = repo
      .createQueryBuilder("payment")
      .leftJoinAndSelect("payment.worker", "worker")
      .leftJoinAndSelect("payment.pitak", "pitak")
      .leftJoinAndSelect("payment.session", "session")
      .leftJoinAndSelect("payment.assignment", "assignment")
      .leftJoinAndSelect("payment.history", "history")
      .leftJoinAndSelect("payment.debtPayments", "debtPayments")
      .where("payment.id = :id", { id });

    if (!includeDeleted) {
      qb.andWhere("payment.deletedAt IS NULL");
    }

    const payment = await qb.getOne();
    if (!payment) throw new Error(`Payment with ID ${id} not found`);

    await auditLogger.logView("Payment", id, "system");
    return payment;
  }

  /**
   * Find all payments with filters, pagination, sorting
   * @param {Object} options
   */
  async findAll(options = {}) {
    const { payment: repo } = await this.getRepositories();

    const qb = repo
      .createQueryBuilder("payment")
      .leftJoinAndSelect("payment.worker", "worker")
      .leftJoinAndSelect("payment.pitak", "pitak")
      .leftJoinAndSelect("payment.session", "session")
      .leftJoinAndSelect("payment.assignment", "assignment");

    // Exclude soft-deleted unless requested
    if (!options.includeDeleted) {
      qb.andWhere("payment.deletedAt IS NULL");
    }

    // Filters
    if (options.workerId) {
      qb.andWhere("worker.id = :workerId", { workerId: options.workerId });
    }
    if (options.pitakId) {
      qb.andWhere("pitak.id = :pitakId", { pitakId: options.pitakId });
    }
    if (options.sessionId) {
      qb.andWhere("session.id = :sessionId", { sessionId: options.sessionId });
    }
    if (options.assignmentId) {
      qb.andWhere("assignment.id = :assignmentId", {
        assignmentId: options.assignmentId,
      });
    }
    if (options.status) {
      qb.andWhere("payment.status = :status", { status: options.status });
    }
    if (options.startDate) {
      qb.andWhere("payment.paymentDate >= :startDate", {
        startDate: new Date(options.startDate),
      });
    }
    if (options.endDate) {
      qb.andWhere("payment.paymentDate <= :endDate", {
        endDate: new Date(options.endDate),
      });
    }
    if (options.minAmount) {
      qb.andWhere("payment.amount >= :minAmount", {
        minAmount: options.minAmount,
      });
    }
    if (options.maxAmount) {
      qb.andWhere("payment.amount <= :maxAmount", {
        maxAmount: options.maxAmount,
      });
    }
    if (options.search) {
      qb.andWhere(
        "(worker.name LIKE :search OR pitak.name LIKE :search OR payment.description LIKE :search)",
        { search: `%${options.search}%` },
      );
    }
    if (options.idempotencyKey) {
      qb.andWhere("payment.idempotencyKey = :key", {
        key: options.idempotencyKey,
      });
    }

    // Sorting
    const sortBy = options.sortBy || "createdAt";
    const sortOrder = options.sortOrder === "ASC" ? "ASC" : "DESC";
    qb.orderBy(`payment.${sortBy}`, sortOrder);

    // Pagination using utility
    const result = await paginateQueryBuilder(qb, {
      page: options.page,
      limit: options.limit,
    });

    await auditLogger.logView("Payment", null, "system");
    return result; // { data: [], pagination: {} }
  }

  /**
   * Get payment statistics based on filters (same as findAll)
   * @param {Object} options - same filter options as findAll
   * @returns {Promise<Object>} - totals and breakdowns
   */
  async getStatistics(options = {}) {
    const { payment: repo } = await this.getRepositories();

    const qb = repo
      .createQueryBuilder("payment")
      .leftJoin("payment.worker", "worker")
      .leftJoin("payment.pitak", "pitak")
      .leftJoin("payment.session", "session")
      .where("payment.deletedAt IS NULL");

    // Apply filters exactly like findAll
    if (options.workerId) {
      qb.andWhere("worker.id = :workerId", { workerId: options.workerId });
    }
    if (options.pitakId) {
      qb.andWhere("pitak.id = :pitakId", { pitakId: options.pitakId });
    }
    if (options.sessionId) {
      qb.andWhere("session.id = :sessionId", { sessionId: options.sessionId });
    }
    if (options.status) {
      qb.andWhere("payment.status = :status", { status: options.status });
    }
    if (options.startDate) {
      qb.andWhere("payment.paymentDate >= :startDate", {
        startDate: new Date(options.startDate),
      });
    }
    if (options.endDate) {
      qb.andWhere("payment.paymentDate <= :endDate", {
        endDate: new Date(options.endDate),
      });
    }
    if (options.search) {
      qb.andWhere(
        "(worker.name LIKE :search OR pitak.location LIKE :search OR payment.referenceNumber LIKE :search)",
        { search: `%${options.search}%` },
      );
    }
    if (options.idempotencyKey) {
      qb.andWhere("payment.idempotencyKey = :key", {
        key: options.idempotencyKey,
      });
    }

    // Get aggregate sums
    const sums = await qb
      .clone()
      .select([
        "SUM(payment.grossPay) as totalGross",
        "SUM(payment.netPay) as totalNet",
        "SUM(payment.totalDebtDeduction) as totalDebtDeduction",
      ])
      .getRawOne();

    // Get status breakdown
    const statusBreakdown = await qb
      .clone()
      .select("payment.status", "status")
      .addSelect("COUNT(payment.id)", "count")
      .groupBy("payment.status")
      .getRawMany();

    const breakdown = statusBreakdown.reduce((acc, row) => {
      acc[row.status] = parseInt(row.count, 10);
      return acc;
    }, {});

    return {
      totalGross: parseFloat(sums.totalGross) || 0,
      totalNet: parseFloat(sums.totalNet) || 0,
      totalDebtDeduction: parseFloat(sums.totalDebtDeduction) || 0,
      breakdown,
    };
  }

  /**
   * Export payments to CSV or JSON
   * @param {string} format - 'csv' or 'json'
   * @param {Object} filters
   * @param {string} user
   */
  async exportPayments(format = "json", filters = {}, user = "system") {
    const result = await this.findAll(filters);
    const payments = result.data;

    let exportData;
    if (format === "csv") {
      const headers = [
        "ID",
        "Worker ID",
        "Worker Name",
        "Pitak ID",
        "Pitak Name",
        "Session ID",
        "Assignment ID",
        "Amount",
        "Payment Date",
        "Description",
        "Status",
        "Idempotency Key",
        "Created At",
        "Updated At",
      ];
      const rows = payments.map((p) => [
        p.id,
        p.worker?.id ?? "",
        p.worker?.name ?? "",
        p.pitak?.id ?? "",
        p.pitak?.name ?? "",
        p.session?.id ?? "",
        p.assignment?.id ?? "",
        p.amount,
        new Date(p.paymentDate).toLocaleDateString(),
        p.description ?? "",
        p.status,
        p.idempotencyKey ?? "",
        new Date(p.createdAt).toLocaleDateString(),
        new Date(p.updatedAt).toLocaleDateString(),
      ]);
      exportData = {
        format: "csv",
        data: [headers, ...rows].map((row) => row.join(",")).join("\n"),
        filename: `payments_export_${new Date().toISOString().split("T")[0]}.csv`,
      };
    } else {
      exportData = {
        format: "json",
        data: payments,
        filename: `payments_export_${new Date().toISOString().split("T")[0]}.json`,
      };
    }

    await auditLogger.logExport("Payment", format, filters, user);
    console.log(`Exported ${payments.length} payments in ${format} format`);
    return exportData;
  }

  /**
   * Bulk create payments
   * @param {Array<Object>} paymentsArray
   * @param {string} user
   * @param {import("typeorm").QueryRunner | null} qr
   */
  async bulkCreate(paymentsArray, user = "system", qr = null) {
    const results = { created: [], errors: [] };
    for (const data of paymentsArray) {
      try {
        const saved = await this.create(data, user, qr);
        results.created.push(saved);
      } catch (err) {
        results.errors.push({ payment: data, error: err.message });
      }
    }
    return results;
  }

  /**
   * Bulk update payments
   * @param {Array<{ id: number, updates: Object }>} updatesArray
   * @param {string} user
   * @param {import("typeorm").QueryRunner | null} qr
   */
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

  /**
   * Import payments from CSV file
   * @param {string} filePath
   * @param {string} user
   * @param {import("typeorm").QueryRunner | null} qr
   */
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
        const paymentData = {
          workerId: parseInt(record.workerId, 10),
          pitakId: parseInt(record.pitakId, 10),
          sessionId: parseInt(record.sessionId, 10),
          assignmentId: record.assignmentId
            ? parseInt(record.assignmentId, 10)
            : undefined,
          amount: parseFloat(record.amount),
          paymentDate:
            record.paymentDate || new Date().toISOString().split("T")[0],
          description: record.description || null,
          status: record.status || "pending",
          idempotencyKey: record.idempotencyKey || null,
        };
        if (!paymentData.workerId) throw new Error("workerId is required");
        if (!paymentData.pitakId) throw new Error("pitakId is required");
        if (!paymentData.sessionId) throw new Error("sessionId is required");
        if (isNaN(paymentData.amount))
          throw new Error("amount must be a number");
        const saved = await this.create(paymentData, user, qr);
        results.imported.push(saved);
      } catch (err) {
        results.errors.push({ row: record, error: err.message });
      }
    }
    return results;
  }

  /**
   * Record a payment transaction (partial or full)
   * @param {number} paymentId
   * @param {Object} recordData - { amountPaid, applyToDebt, paymentMethod, referenceNumber, notes }
   * @param {string} user
   * @param {import("typeorm").QueryRunner|null} qr
   */
  async recordPayment(paymentId, recordData, user = "system", qr = null) {
    const { updateDb, saveDb } = require("../utils/dbUtils/dbActions");
    const Payment = require("../entities/Payment");
    const PaymentHistory = require("../entities/PaymentHistory");
    const debtService = require("./DebtService");

    const paymentRepo = this._getRepo(qr, Payment);
    const historyRepo = this._getRepo(qr, PaymentHistory);

    // 1. Get payment with relations
    const payment = await paymentRepo.findOne({
      where: { id: paymentId, deletedAt: null },
      relations: ["worker", "pitak", "session"],
    });
    if (!payment) throw new Error(`Payment #${paymentId} not found`);

    // 2. Validate
    if (payment.status === "cancelled") {
      throw new Error("Cannot record payment for a cancelled payment");
    }
    if (payment.status === "completed") {
      throw new Error("Payment is already completed");
    }

    const { amountPaid, applyToDebt, paymentMethod, referenceNumber, notes } =
      recordData;

    if (!amountPaid || amountPaid <= 0)
      throw new Error("Amount paid must be greater than zero");

    const newAmountPaid = (payment.amountPaid || 0) + amountPaid;
    if (newAmountPaid > payment.grossPay) {
      throw new Error(
        `Total amount paid (${newAmountPaid}) exceeds gross pay (${payment.grossPay})`,
      );
    }

    if (applyToDebt < 0 || applyToDebt > amountPaid) {
      throw new Error("Apply to debt amount must be between 0 and amount paid");
    }

    // 3. Calculate new totals
    const oldAmountPaid = payment.amountPaid || 0;
    const oldDebtDeduction = payment.debtDeductionTotal || 0;
    const newDebtDeduction = oldDebtDeduction + applyToDebt;

    // Recalculate netPay = grossPay - manualDeduction - totalDebtDeduction
    const manualDeduction = payment.manualDeduction || 0;
    const newNetPay = payment.grossPay - manualDeduction - newDebtDeduction;
    if (newNetPay < 0)
      throw new Error("Net pay cannot be negative after debt deduction");

    // 4. Update payment
    payment.amountPaid = newAmountPaid;
    payment.lastPaymentDate = new Date();
    payment.debtDeductionTotal = newDebtDeduction;
    payment.netPay = newNetPay;
    payment.paymentMethod = paymentMethod || payment.paymentMethod;
    payment.referenceNumber = referenceNumber || payment.referenceNumber;
    payment.notes = notes
      ? payment.notes
        ? payment.notes + "\n" + notes
        : notes
      : payment.notes;
    payment.status =
      newAmountPaid >= payment.grossPay ? "completed" : "partially_paid";
    payment.updatedAt = new Date();

    await updateDb(paymentRepo, payment, { queryRunner: qr });

    // 5. Deduct from debts if applyToDebt > 0
    let actualDeducted = 0;
    if (applyToDebt > 0) {
      actualDeducted = await debtService.deductFromWorker(
        payment.worker.id,
        applyToDebt,
        payment.id,
        payment.session.id,
        user,
        qr,
      );
      if (actualDeducted < applyToDebt) {
        console.warn(
          `Only ${actualDeducted} of ${applyToDebt} could be deducted from debts`,
        );
      }
    }

    // 6. Create PaymentHistory entry
    const history = historyRepo.create({
      payment,
      actionType: "payment_recorded",
      changedField: "amountPaid",
      oldValue: oldAmountPaid.toString(),
      newValue: newAmountPaid.toString(),
      oldAmount: oldAmountPaid,
      newAmount: newAmountPaid,
      notes: `Recorded payment of ${amountPaid}, applied ${actualDeducted} to debt`,
      performedBy: user,
      referenceNumber: referenceNumber,
    });
    await saveDb(historyRepo, history, { queryRunner: qr });
    await auditLogger.logCreate("PaymentHistory", history.id, history, user);

    // 7. Audit log
    await auditLogger.logUpdate(
      "Payment",
      payment.id,
      { amountPaid: oldAmountPaid },
      { amountPaid: newAmountPaid },
      user,
    );

    return payment;
  }

  /**
   * Record a bulk payment for a worker (one transaction covering debt deduction and multiple payments)
   * @param {number} workerId
   * @param {number} totalAmount - Total cash given to worker
   * @param {number} debtDeduction - Portion to apply to outstanding debts
   * @param {string} paymentMethod
   * @param {string|null} referenceNumber
   * @param {string|null} notes
   * @param {string} user
   * @param {import("typeorm").QueryRunner|null} qr
   * @returns {Promise<Object>}
   */
  async recordWorkerPayment(
    workerId,
    totalAmount,
    debtDeduction,
    paymentMethod,
    referenceNumber,
    notes,
    user = "system",
    qr = null,
  ) {
    const { updateDb, saveDb } = require("../utils/dbUtils/dbActions");
    const { In } = require("typeorm");
    const Payment = require("../entities/Payment");
    const PaymentHistory = require("../entities/PaymentHistory");
    const debtService = require("./DebtService");

    const paymentRepo = this._getRepo(qr, Payment);
    const historyRepo = this._getRepo(qr, PaymentHistory);

    // 1. Basic validation
    if (totalAmount <= 0)
      throw new Error("Total amount must be greater than zero");
    if (debtDeduction < 0) throw new Error("Debt deduction cannot be negative");
    if (debtDeduction > totalAmount)
      throw new Error("Debt deduction cannot exceed total amount");

    // Round totalAmount to 2 decimals
    const roundedTotal = roundToTwo(totalAmount);
    const roundedDeduction = roundToTwo(debtDeduction);

    // 2. Get total outstanding debt balance for this worker (no session filter)
    const debtStats = await debtService.getStatisticsWithFilters({ workerId });
    const totalDebtBalance = roundToTwo(debtStats.totalBalance || 0);

    // 3. Get total pending payments (ALL payments, no session filter)
    const pendingPaymentsList = await paymentRepo.find({
      where: {
        worker: { id: workerId },
        status: In(["pending", "partially_paid"]),
        deletedAt: null,
      },
      order: { paymentDate: "ASC", createdAt: "ASC" },
    });
    const rawPaymentsDue = pendingPaymentsList.reduce(
      (sum, p) => sum + (p.netPay - (p.amountPaid || 0)),
      0,
    );
    const totalPaymentsDue = roundToTwo(rawPaymentsDue);
    const totalDue = roundToTwo(totalPaymentsDue + totalDebtBalance);

    if (roundedTotal > totalDue) {
      throw new Error(
        `Total amount (${roundedTotal}) exceeds total due (${totalDue}). ` +
          `Outstanding debt: ${totalDebtBalance}, Payments due: ${totalPaymentsDue}`,
      );
    }

    // 4. Apply debt deduction (no sessionId)
    let actualDebtDeducted = 0;
    if (roundedDeduction > 0) {
      actualDebtDeducted = await debtService.deductFromWorker(
        workerId,
        roundedDeduction,
        null,
        null, // sessionId = null – ignore session
        user,
        qr,
      );
      if (actualDebtDeducted < roundedDeduction) {
        throw new Error(
          `Only ${actualDebtDeducted} of ${roundedDeduction} debt could be deducted. Insufficient debt balance.`,
        );
      }
    }

    // 5. Remaining amount for payments
    let remainingForPayments = roundToTwo(roundedTotal - actualDebtDeducted);
    if (remainingForPayments < 0) remainingForPayments = 0;

    if (remainingForPayments === 0) {
      return {
        success: true,
        totalAmount: roundedTotal,
        debtDeducted: actualDebtDeducted,
        paymentsUpdated: 0,
        remainingUnallocated: 0,
      };
    }

    if (pendingPaymentsList.length === 0) {
      throw new Error(
        "No pending payments found for this worker, but remaining amount is non-zero.",
      );
    }

    // 6. Distribute remainingForPayments across payments (FIFO)
    let remaining = remainingForPayments;
    const updates = [];
    for (const payment of pendingPaymentsList) {
      if (remaining <= 0) break;
      const due = payment.netPay - (payment.amountPaid || 0);
      if (due <= 0) continue;
      const payAmount = Math.min(remaining, due);
      updates.push({ payment, amount: roundToTwo(payAmount) });
      remaining = roundToTwo(remaining - payAmount);
    }

    if (updates.length === 0) {
      throw new Error("No payments needed updating (all already paid?)");
    }

    // 7. Update each payment and create history
    for (const { payment, amount } of updates) {
      const oldAmountPaid = roundToTwo(payment.amountPaid || 0);
      const newAmountPaid = roundToTwo(oldAmountPaid + amount);

      payment.amountPaid = newAmountPaid;
      payment.lastPaymentDate = new Date();
      payment.netPay = roundToTwo(payment.netPay);
      const newStatus =
        newAmountPaid >= payment.netPay ? "completed" : "partially_paid";
      payment.status = newStatus;
      payment.updatedAt = new Date();

      await updateDb(paymentRepo, payment, {
        queryRunner: qr,
        skipSignal: false,
      });

      const history = historyRepo.create({
        payment,
        actionType: "payment_recorded",
        changedField: "amountPaid",
        oldValue: oldAmountPaid.toString(),
        newValue: newAmountPaid.toString(),
        oldAmount: oldAmountPaid,
        newAmount: newAmountPaid,
        notes: `Part of bulk worker payment. Total: ${roundedTotal}, debt deducted: ${actualDebtDeducted}. ${notes || ""}`,
        performedBy: user,
        referenceNumber: referenceNumber,
      });
      await saveDb(historyRepo, history, { queryRunner: qr });
      await auditLogger.logCreate("PaymentHistory", history.id, history, user);
    }

    return {
      success: true,
      totalAmount: roundedTotal,
      debtDeducted: actualDebtDeducted,
      paymentsUpdated: updates.length,
      remainingUnallocated: remaining,
      totalPaymentsDue,
      totalDebtBalance,
    };
  }
}

const roundToTwo = (num) => {
  if (num === undefined || num === null) return 0;
  return Math.round((num + Number.EPSILON) * 100) / 100;
};

// Singleton instance
const paymentService = new PaymentService();
module.exports = paymentService;
