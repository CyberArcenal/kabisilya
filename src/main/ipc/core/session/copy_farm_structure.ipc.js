// src/main/ipc/session/copy_farm_structure.ipc.js
// @ts-check
const sessionService = require("../../../../services/SessionService");
const { logger } = require("../../../../utils/logger");

module.exports = async function copyFarmStructure(params, queryRunner) {
  try {
    const { sourceSessionId, targetSessionId, bukidIds, includeAssignments } = params;
    logger.info("IPC: copyFarmStructure", { sourceSessionId, targetSessionId, bukidIds, includeAssignments });

    if (!sourceSessionId || !targetSessionId) {
      return { status: false, message: "sourceSessionId and targetSessionId are required", data: null };
    }

    const result = await sessionService.copyFarmStructure(
      sourceSessionId,
      targetSessionId,
      bukidIds || [],
      { includeAssignments: !!includeAssignments },
      "system",
      queryRunner
    );

    return { status: true, message: "Farm structure copied successfully", data: result };
  } catch (error) {
    logger.error("IPC: copyFarmStructure error:", error);
    return { status: false, message: error.message || "Failed to copy farm structure", data: null };
  }
};