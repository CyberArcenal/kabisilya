// src/main/ipc/utils/system_config/update_grouped.ipc.js
const {systemSettingService} = require("../../../../services/Settings");

module.exports = async (params, queryRunner) => {
  const { configData, userId } = params;
  let parsedConfig = configData;

  // Parse if it's a JSON string
  if (typeof configData === 'string') {
    try {
      parsedConfig = JSON.parse(configData);
    } catch (e) {
      return {
        status: false,
        message: "Invalid JSON in configData",
        data: { errors: ["Failed to parse configData: " + e.message] }
      };
    }
  }

  console.log("[updateGroupedConfig] Parsed config:", JSON.stringify(parsedConfig, null, 2));

  const result = await systemSettingService.updateGroupedConfig(parsedConfig, `user_${userId}`, queryRunner);

  if (result.errors.length > 0) {
    console.error("[updateGroupedConfig] Errors:", result.errors);
  }
  console.log("[updateGroupedConfig] Result:", { updated: result.updated.length, errors: result.errors.length });

  const success = result.errors.length === 0;
  return {
    status: success,
    message: success ? "Configuration updated" : `Updated with ${result.errors.length} errors`,
    data: result,
  };
};