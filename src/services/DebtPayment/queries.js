// services/debtPayment/queries.js
//@ts-check

/**
 * Query builder helper para sa DebtPayment
 * @param {import("typeorm").Repository} repo
 * @param {Object} options
 * @param {boolean} includeDeleted
 * @returns {import("typeorm").SelectQueryBuilder}
 */
function buildDebtPaymentQuery(repo, options = {}, includeDeleted = false) {
  const qb = repo
    .createQueryBuilder("debtPayment")
    .leftJoinAndSelect("debtPayment.payment", "payment")
    .leftJoinAndSelect("payment.worker", "worker")
    .leftJoinAndSelect("payment.pitak", "pitak")
    .leftJoinAndSelect("payment.session", "paymentSession")
    .leftJoinAndSelect("debtPayment.debt", "debt")
    .leftJoinAndSelect("debt.worker", "debtWorker")
    .leftJoinAndSelect("debt.session", "debtSession");

  if (!includeDeleted) {
    qb.andWhere("debtPayment.deletedAt IS NULL");
  }

  // Filters
  if (options.paymentId) {
    qb.andWhere("payment.id = :paymentId", { paymentId: options.paymentId });
  }
  if (options.debtId) {
    qb.andWhere("debt.id = :debtId", { debtId: options.debtId });
  }
  if (options.workerId) {
    qb.andWhere("worker.id = :workerId", { workerId: options.workerId });
  }
  if (options.sessionId) {
    qb.andWhere(
      "(paymentSession.id = :sessionId OR debtSession.id = :sessionId)",
      { sessionId: options.sessionId },
    );
  }
  if (options.startDate) {
    qb.andWhere("debtPayment.createdAt >= :startDate", {
      startDate: new Date(options.startDate),
    });
  }
  if (options.endDate) {
    qb.andWhere("debtPayment.createdAt <= :endDate", {
      endDate: new Date(options.endDate),
    });
  }
  if (options.minAmount) {
    qb.andWhere("debtPayment.amount >= :minAmount", {
      minAmount: options.minAmount,
    });
  }
  if (options.maxAmount) {
    qb.andWhere("debtPayment.amount <= :maxAmount", {
      maxAmount: options.maxAmount,
    });
  }
  if (options.search) {
    qb.andWhere(
      "(worker.name LIKE :search OR debtWorker.name LIKE :search OR debt.reason LIKE :search)",
      { search: `%${options.search}%` },
    );
  }

  // Sorting
  const sortBy = options.sortBy || "createdAt";
  const sortOrder = options.sortOrder === "ASC" ? "ASC" : "DESC";
  qb.orderBy(`debtPayment.${sortBy}`, sortOrder);

  return qb;
}

module.exports = {
  buildDebtPaymentQuery,
};