// src/utils/subscriberLogger.js
const { logger } = require('./logger');

/**
 * Ligtas na pag-stringify ng object na may limit sa lalim (depth) at iwas circular reference.
 * @param {any} obj - Ang object na isa-stringify
 * @param {number} maxDepth - Maximum na lalim (default: 2)
 * @returns {string} JSON string
 */
function safeStringify(obj, maxDepth = 2) {
  const seen = new WeakSet();

  function serialize(value, depth) {
    if (depth > maxDepth) return '[Max Depth]';
    if (value === null || value === undefined) return value;
    if (typeof value === 'function') return '[Function]';
    if (typeof value !== 'object') return value;

    if (seen.has(value)) return '[Circular]';
    seen.add(value);

    if (Array.isArray(value)) {
      return value.map(item => serialize(item, depth + 1));
    }

    const result = {};
    for (const [key, val] of Object.entries(value)) {
      // I-skip ang malalaking nested objects (hal. relations) para iwas bloated logs
      if (key === 'worker' || key === 'pitak' || key === 'session' || key === 'assignment') {
        // I-log lang ang ID ng relation
        result[key] = val?.id ? { id: val.id } : null;
        continue;
      }
      result[key] = serialize(val, depth + 1);
    }
    return result;
  }

  try {
    const serialized = serialize(obj, 0);
    return JSON.stringify(serialized, null, 2);
  } catch (err) {
    return '[Serialization Error]';
  }
}

/**
 * Mag-log ng subscriber event (info level) kasama ang entity data.
 * @param {string} subscriberName - Pangalan ng subscriber
 * @param {string} hook - Lifecycle hook
 * @param {any} entity - Entity object (maaaring null)
 * @param {object} extra - Karagdagang fields (override)
 */
function logSubscriberEvent(subscriberName, hook, entity, extra = {}) {
  const logData = {
    subscriber: subscriberName,
    hook,
    entity: entity?.constructor?.name || 'Unknown',
    entityId: entity?.id,
    ...extra,
  };

  // Isama ang serialized entity data (limitado sa depth 2)
  if (entity && typeof entity === 'object') {
    try {
      logData.entityData = safeStringify(entity, 2);
    } catch (err) {
      logData.entityData = '[Serialization Error]';
    }
  }

  logger.info(`[${subscriberName}] ${hook}`, logData);
}

/**
 * Mag-log ng subscriber error.
 */
function logSubscriberError(subscriberName, hook, error, extra = {}) {
  logger.error(`[${subscriberName}] ${hook} error`, {
    error: error.message,
    stack: error.stack,
    ...extra,
  });
}

module.exports = {
  safeStringify,
  logSubscriberEvent,
  logSubscriberError,
};