
/**
 * Round to two decimal places
 * @param {number} num
 * @returns {number}
 */
function roundToTwo(num) {
  if (num === undefined || num === null) return 0;
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Get repository helper (transactional)
 */
function getRepo(qr, entityClass, dataSource) {
  const qrType = qr === null ? "null" : qr === undefined ? "undefined" : typeof qr;
  const hasManager = qr && typeof qr === "object" && !!qr.manager;
  if (hasManager && typeof qr.manager.getRepository === "function") {
    return qr.manager.getRepository(entityClass);
  }
  const { AppDataSource } = require("../../main/db/data-source");
  return AppDataSource.getRepository(entityClass);
}

module.exports = {
  roundToTwo,
  getRepo,
};