// services/BukidService.js
// Refactored to follow the same structure as DebtService, BorrowerService, and AssignmentService

const auditLogger = require("../utils/auditLogger");
const { farmSessionDefaultSessionId } = require("../utils/settings/system");
const { paginateQueryBuilder } = require("../utils/dbUtils/pagination");

class BukidService {
  constructor() {
    this.bukidRepository = null;
    this.sessionRepository = null;
  }

  async initialize() {
    const { AppDataSource } = require("../main/db/data-source");
    const Bukid = require("../entities/Bukid");
    const Session = require("../entities/Session");

    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    this.bukidRepository = AppDataSource.getRepository(Bukid);
    this.sessionRepository = AppDataSource.getRepository(Session);
    console.log("BukidService initialized");
  }

  async getRepositories() {
    if (!this.bukidRepository) {
      await this.initialize();
    }
    return {
      bukid: this.bukidRepository,
      session: this.sessionRepository,
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
      `[Bukid._getRepo] qr type: ${qrType}, has manager: ${hasManager}`,
    );

    if (hasManager && typeof qr.manager.getRepository === "function") {
      return qr.manager.getRepository(entityClass);
    }
    const { AppDataSource } = require("../main/db/data-source");
    console.log(`[Bukid._getRepo] Using global repository (fallback)`);
    return AppDataSource.getRepository(entityClass);
  }

  /**
   * Create a new bukid
   * @param {Object} data - { name, location?, area?, description?, status?, sessionId }
   * @param {string} user
   * @param {import("typeorm").QueryRunner | null} qr
   */
  async create(data, user = "system", qr = null) {
    const { saveDb } = require("../utils/dbUtils/dbActions");
    const Bukid = require("../entities/Bukid");
    const Session = require("../entities/Session");

    const bukidRepo = this._getRepo(qr, Bukid);
    const sessionRepo = this._getRepo(qr, Session);

    try {
      if (!data.name) throw new Error("Bukid name is required");
      if (!data.sessionId) throw new Error("sessionId is required");

      const session = await sessionRepo.findOne({
        where: { id: data.sessionId },
      });
      if (!session)
        throw new Error(`Session with ID ${data.sessionId} not found`);
      
      if (session.status !== "active") {
        throw new Error(
          `Cannot create bukid because session "${session.name}" is not active. Only active sessions allow creation.`,
        );
      }
      const bukidData = {
        name: data.name,
        location: data.location || null,
        area: data.area || null,
        description: data.description || null,
        status: data.status || "active",
        session,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const bukid = bukidRepo.create(bukidData);
      const saved = await saveDb(bukidRepo, bukid, { queryRunner: qr });
      await auditLogger.logCreate("Bukid", saved.id, saved, user);
      return saved;
    } catch (error) {
      console.error("Failed to create bukid:", error.message);
      throw error;
    }
  }

  /**
   * Update an existing bukid
   * @param {number} id
   * @param {Object} data - { name?, location?, area?, description?, status?, sessionId? }
   * @param {string} user
   * @param {import("typeorm").QueryRunner | null} qr
   */
  async update(id, data, user = "system", qr = null) {
    const { updateDb } = require("../utils/dbUtils/dbActions");
    const Bukid = require("../entities/Bukid");
    const Session = require("../entities/Session");

    const bukidRepo = this._getRepo(qr, Bukid);
    const sessionRepo = this._getRepo(qr, Session);

    try {
      const existing = await bukidRepo.findOne({
        where: { id, deletedAt: null },
        relations: ["session"],
      });
      if (!existing) throw new Error(`Bukid with ID ${id} not found`);

      const oldData = { ...existing };

      // Handle sessionId update separately
      if (data.sessionId !== undefined) {
        const session = await sessionRepo.findOne({
          where: { id: data.sessionId },
        });
        if (!session)
          throw new Error(`Session with ID ${data.sessionId} not found`);
        existing.session = session;
        delete data.sessionId;
      }

      if (existing.session.status !== "active") {
        throw new Error(
          `Cannot update bukid "${existing.name}" because its session (${existing.session.name}) is not active. Only active sessions allow modifications.`,
        );
      }

      // Apply other updates (skip status if you want to use updateStatus separately)
      Object.assign(existing, data);
      existing.updatedAt = new Date();

      const saved = await updateDb(bukidRepo, existing, { queryRunner: qr });
      await auditLogger.logUpdate("Bukid", id, oldData, saved, user);
      return saved;
    } catch (error) {
      console.error("Failed to update bukid:", error.message);
      throw error;
    }
  }

  /**
   * Update bukid status with validation of allowed transitions
   * @param {number} id
   * @param {string} newStatus
   * @param {string} user
   * @param {import("typeorm").QueryRunner | null} qr
   */
  async updateStatus(id, newStatus, user = "system", qr = null) {
    const { updateDb } = require("../utils/dbUtils/dbActions");
    const Bukid = require("../entities/Bukid");
    const bukidRepo = this._getRepo(qr, Bukid);

    const bukid = await bukidRepo.findOne({
      where: { id, deletedAt: null },
      relations: ["session"],
    });
    if (!bukid) throw new Error(`Bukid with ID ${id} not found`);

    const oldStatus = bukid.status;
    if (oldStatus === newStatus) return bukid;

    // Allowed transitions based on typical farm management
    const allowedTransitions = {
      initiated: ["active", "completed", "cancelled"],
      active: ["completed", "cancelled"],
      completed: [],
      cancelled: [],
    };

    if (!allowedTransitions[oldStatus]?.includes(newStatus)) {
      throw new Error(
        `Invalid status transition from ${oldStatus} to ${newStatus}`,
      );
    }

    if (bukid.session.status !== "active") {
      throw new Error(
        `Cannot change status of bukid "${bukid.name}" because its session (${bukid.session.name}) is not active. Only active sessions allow modifications.`,
      );
    }

    bukid.status = newStatus;
    bukid.updatedAt = new Date();

    const saved = await updateDb(bukidRepo, bukid, { queryRunner: qr });
    await auditLogger.logUpdate(
      "Bukid",
      id,
      { status: oldStatus },
      { status: newStatus },
      user,
    );
    return saved;
  }

  /**
   * Soft delete a bukid (set deletedAt)
   * @param {number} id
   * @param {string} user
   * @param {import("typeorm").QueryRunner | null} qr
   */
  async delete(id, user = "system", qr = null) {
    const { updateDb } = require("../utils/dbUtils/dbActions");
    const Bukid = require("../entities/Bukid");
    const bukidRepo = this._getRepo(qr, Bukid);

    try {
      const bukid = await bukidRepo.findOne({
        where: { id, deletedAt: null },
        relations: ["session"],
      });
      if (!bukid) throw new Error(`Bukid with ID ${id} not found`);
      if (bukid.deletedAt) throw new Error(`Bukid #${id} is already deleted`);
      if (bukid.session.status !== "active") {
        throw new Error(
          `Cannot delete bukid "${bukid.name}" because its session (${bukid.session.name}) is not active. Only active sessions allow modifications.`,
        );
      }
      const oldData = { ...bukid };
      bukid.deletedAt = new Date();
      bukid.updatedAt = new Date();

      const saved = await updateDb(bukidRepo, bukid, { queryRunner: qr });
      await auditLogger.logDelete("Bukid", id, oldData, user);
      console.log(`Bukid soft deleted: #${id}`);
      return saved;
    } catch (error) {
      console.error("Failed to delete bukid:", error.message);
      throw error;
    }
  }

  /**
   * Restore a soft-deleted bukid
   * @param {number} id
   * @param {string} user
   * @param {import("typeorm").QueryRunner | null} qr
   */
  async restore(id, user = "system", qr = null) {
    const { updateDb } = require("../utils/dbUtils/dbActions");
    const Bukid = require("../entities/Bukid");
    const bukidRepo = this._getRepo(qr, Bukid);

    try {
      const bukid = await bukidRepo.findOne({
        where: { id },
        withDeleted: true,
        relations: ["session"],
      });
      if (!bukid) throw new Error(`Bukid with ID ${id} not found`);
      if (!bukid.deletedAt) throw new Error(`Bukid #${id} is not deleted`);
      if (bukid.session.status !== "active") {
        throw new Error(
          `Cannot restore bukid "${bukid.name}" because its session (${bukid.session.name}) is not active. Only active sessions allow modifications.`,
        );
      }
      bukid.deletedAt = null;
      bukid.updatedAt = new Date();

      const saved = await updateDb(bukidRepo, bukid, { queryRunner: qr });
      await auditLogger.logUpdate(
        "Bukid",
        id,
        { deletedAt: true },
        { deletedAt: null },
        user,
      );
      console.log(`Bukid restored: #${id}`);
      return saved;
    } catch (error) {
      console.error("Failed to restore bukid:", error.message);
      throw error;
    }
  }

  /**
   * Permanently delete a bukid (hard delete) – use with caution
   * @param {number} id
   * @param {string} user
   * @param {import("typeorm").QueryRunner | null} qr
   */
  async permanentlyDelete(id, user = "system", qr = null) {
    const { removeDb } = require("../utils/dbUtils/dbActions");
    const Bukid = require("../entities/Bukid");
    const bukidRepo = this._getRepo(qr, Bukid);

    const bukid = await bukidRepo.findOne({
      where: { id },
      withDeleted: true,
      relations: ["session"],
    });
    if (!bukid) throw new Error(`Bukid with ID ${id} not found`);

    if (bukid.session.status !== "active") {
      throw new Error(
        `Cannot delete bukid "${bukid.name}" because its session (${bukid.session.name}) is not active. Only active sessions allow modifications.`,
      );
    }

    await removeDb(bukidRepo, bukid);
    await auditLogger.logDelete("Bukid", id, bukid, user);
    console.log(`Bukid #${id} permanently deleted`);
  }

  /**
   * Find bukid by ID (excludes soft-deleted by default)
   * @param {number} id
   * @param {boolean} includeDeleted
   */
  async findById(id, includeDeleted = false) {
    const { bukid: repo } = await this.getRepositories();

    const qb = repo
      .createQueryBuilder("bukid")
      .leftJoinAndSelect("bukid.session", "session")
      .leftJoinAndSelect("bukid.pitaks", "pitaks")
      .where("bukid.id = :id", { id });

    if (!includeDeleted) {
      qb.andWhere("bukid.deletedAt IS NULL");
    }

    const bukid = await qb.getOne();
    if (!bukid) throw new Error(`Bukid with ID ${id} not found`);

    // Enforce current session
    const defaultSessionId = await farmSessionDefaultSessionId();
    if (!defaultSessionId) {
      throw new Error("No default session set. Cannot access bukid.");
    }
    if (bukid.session?.id !== defaultSessionId) {
      throw new Error(`Bukid #${id} does not belong to the current session`);
    }

    await auditLogger.logView("Bukid", id, "system");
    return bukid;
  }

  /**
   * Find all bukids with filters, pagination, sorting
   * @param {Object} options
   */
  async findAll(options = {}) {
    const { bukid: repo } = await this.getRepositories();
    const qb = repo
      .createQueryBuilder("bukid")
      .leftJoinAndSelect("bukid.session", "session")
      .leftJoinAndSelect("bukid.pitaks", "pitaks");

    // Exclude soft-deleted unless requested
    if (!options.includeDeleted) {
      qb.andWhere("bukid.deletedAt IS NULL");
    }

    // Apply default session if none provided
    let sessionId = options.sessionId;
    if (!sessionId) {
      sessionId = await farmSessionDefaultSessionId();
      if (!sessionId) {
        console.warn("No default session ID available for Bukid.findAll");
        return {
          data: [],
          pagination: {
            page: options.page || 1,
            limit: options.limit || 10,
            total: 0,
            pages: 0,
          },
        };
      }
    }

    // Filters
    if (sessionId) {
      qb.andWhere("session.id = :sessionId", { sessionId });
    }
    if (options.status) {
      qb.andWhere("bukid.status = :status", { status: options.status });
    }
    if (options.search) {
      qb.andWhere(
        "(bukid.name LIKE :search OR bukid.location LIKE :search OR bukid.description LIKE :search)",
        {
          search: `%${options.search}%`,
        },
      );
    }

    // Sorting
    const sortMap = {
      name: "bukid.name",
      status: "bukid.status",
      area: "bukid.area",
      createdAt: "bukid.createdAt",
      "session.name": "session.name",
    };
    let sortBy =
      options.sortBy && sortMap[options.sortBy]
        ? sortMap[options.sortBy]
        : "bukid.createdAt";
    let sortOrder = options.sortOrder === "ASC" ? "ASC" : "DESC";
    qb.orderBy(sortBy, sortOrder);

    // Pagination using utility
    const result = await paginateQueryBuilder(qb, {
      page: options.page,
      limit: options.limit,
    });

    await auditLogger.logView("Bukid", null, "system");
    return result; // { data: [], pagination: {} }
  }

  /**
   * Get bukid statistics
   */
  async getStatistics() {
    const { bukid: repo } = await this.getRepositories();
    const qb = repo
      .createQueryBuilder("bukid")
      .where("bukid.deletedAt IS NULL");

    const total = await qb.getCount();
    const active = await qb
      .clone()
      .andWhere("bukid.status = :status", { status: "active" })
      .getCount();
    const completed = await qb
      .clone()
      .andWhere("bukid.status = :status", { status: "completed" })
      .getCount();
    const cancelled = await qb
      .clone()
      .andWhere("bukid.status = :status", { status: "cancelled" })
      .getCount();
    const initiated = await qb
      .clone()
      .andWhere("bukid.status = :status", { status: "initiated" })
      .getCount();

    // Sum of area (if numeric)
    const totalAreaResult = await qb
      .clone()
      .select("SUM(bukid.area)", "sum")
      .getRawOne();
    const totalArea = parseFloat(totalAreaResult.sum) || 0;

    return {
      total,
      active,
      completed,
      cancelled,
      initiated,
      totalArea,
    };
  }

  /**
   * Get filtered statistics for bukids (supports same filters as findAll)
   * @param {Object} options - { sessionId, status, search }
   * @returns {Promise<Object>} - totals and breakdowns
   */
  async getStatisticsWithFilters(options = {}) {
    const { bukid: repo } = await this.getRepositories();
    const qb = repo
      .createQueryBuilder("bukid")
      .leftJoin("bukid.session", "session")
      .where("bukid.deletedAt IS NULL");

    // Apply filters
    if (options.sessionId) {
      qb.andWhere("session.id = :sessionId", { sessionId: options.sessionId });
    }
    if (options.status) {
      qb.andWhere("bukid.status = :status", { status: options.status });
    }
    if (options.search) {
      qb.andWhere(
        "(bukid.name LIKE :search OR bukid.location LIKE :search OR bukid.description LIKE :search)",
        {
          search: `%${options.search}%`,
        },
      );
    }

    // Get total count
    const total = await qb.getCount();

    // Get status breakdown
    const statusCounts = await qb
      .clone()
      .select("bukid.status", "status")
      .addSelect("COUNT(bukid.id)", "count")
      .groupBy("bukid.status")
      .getRawMany();

    const breakdown = statusCounts.reduce((acc, row) => {
      acc[row.status] = parseInt(row.count, 10);
      return acc;
    }, {});

    // Get total area (sum of area)
    const totalAreaResult = await qb
      .clone()
      .select("SUM(bukid.area)", "totalArea")
      .getRawOne();
    const totalArea = parseFloat(totalAreaResult.totalArea) || 0;

    // Get total pitaks (sum of pitaks across filtered bukids) – requires joining pitaks
    // This is optional; if you want total pitaks count for summary cards, uncomment:
    /*
  const totalPitaksResult = await qb
    .clone()
    .leftJoin("bukid.pitaks", "pitak")
    .select("COUNT(pitak.id)", "totalPitaks")
    .getRawOne();
  const totalPitaks = parseInt(totalPitaksResult.totalPitaks) || 0;
  */

    return {
      total,
      active: breakdown.active || 0,
      completed: breakdown.completed || 0,
      cancelled: breakdown.cancelled || 0,
      initiated: breakdown.initiated || 0,
      totalArea,
      // totalPitaks, // uncomment if needed
    };
  }

  /**
   * Export bukids to CSV or JSON
   * @param {string} format - 'csv' or 'json'
   * @param {Object} filters
   * @param {string} user
   */
  async exportBukids(format = "json", filters = {}, user = "system") {
    const result = await this.findAll(filters);
    const bukids = result.data;

    let exportData;
    if (format === "csv") {
      const headers = [
        "ID",
        "Name",
        "Location",
        "Area",
        "Description",
        "Status",
        "Session ID",
        "Session Name",
        "Created At",
        "Updated At",
      ];
      const rows = bukids.map((b) => [
        b.id,
        b.name,
        b.location ?? "",
        b.area ?? "",
        b.description ?? "",
        b.status,
        b.session?.id ?? "",
        b.session?.name ?? "",
        new Date(b.createdAt).toLocaleDateString(),
        new Date(b.updatedAt).toLocaleDateString(),
      ]);
      exportData = {
        format: "csv",
        data: [headers, ...rows].map((row) => row.join(",")).join("\n"),
        filename: `bukids_export_${new Date().toISOString().split("T")[0]}.csv`,
      };
    } else {
      exportData = {
        format: "json",
        data: bukids,
        filename: `bukids_export_${new Date().toISOString().split("T")[0]}.json`,
      };
    }

    await auditLogger.logExport("Bukid", format, filters, user);
    console.log(`Exported ${bukids.length} bukids in ${format} format`);
    return exportData;
  }

  /**
   * Bulk create bukids
   * @param {Array<Object>} bukidsArray
   * @param {string} user
   * @param {import("typeorm").QueryRunner | null} qr
   */
  async bulkCreate(bukidsArray, user = "system", qr = null) {
    const results = { created: [], errors: [] };
    for (const data of bukidsArray) {
      try {
        const saved = await this.create(data, user, qr);
        results.created.push(saved);
      } catch (err) {
        results.errors.push({ bukid: data, error: err.message });
      }
    }
    return results;
  }

  /**
   * Bulk update bukids
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
   * Import bukids from CSV file
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
        const bukidData = {
          name: record.name,
          location: record.location || null,
          area: record.area ? parseFloat(record.area) : null,
          description: record.description || null,
          status: record.status || "active",
          sessionId: parseInt(record.sessionId, 10),
        };
        if (!bukidData.name) throw new Error("Name is required");
        if (!bukidData.sessionId) throw new Error("sessionId is required");
        const saved = await this.create(bukidData, user, qr);
        results.imported.push(saved);
      } catch (err) {
        results.errors.push({ row: record, error: err.message });
      }
    }
    return results;
  }
}

// Singleton instance
const bukidService = new BukidService();
module.exports = bukidService;
