// src/main/ipc/core/reminder/search.ipc.js
//@ts-check
const { reminderLogService } = require("../../../../services/ReminderLog");

module.exports = async (params) => {
  const { keyword, page, limit } = params;
  const result = await reminderLogService.searchReminders({
    keyword,
    page,
    limit,
  });
  return { status: true, message: "Search completed locally", ...result };
};
