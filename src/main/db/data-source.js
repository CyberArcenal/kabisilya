//@ts-check
const { DataSource } = require("typeorm");
const Assignment = require("../../entities/Assignment");
const Bukid = require("../../entities/Bukid");
const Debt = require("../../entities/Debt");
const DebtHistory = require("../../entities/DebtHistory");
const LicenseCache = require("../../entities/LicenseCache");
const Notification = require("../../entities/Notification");
const Payment = require("../../entities/Payment");
const PaymentHistory = require("../../entities/PaymentHistory");
const Pitak = require("../../entities/Pitak");
const Worker = require("../../entities/Worker");
const { getDatabaseConfig } = require("./database");
const { SystemSetting } = require("../../entities/systemSettings");
const Session = require("../../entities/Session");
const { AuditLog } = require("../../entities/AuditLog");
const NotificationLog = require("../../entities/NotificationLog");

const config = getDatabaseConfig();

const entities = [
  Session,
  Assignment,
  AuditLog,
  Bukid,
  Debt,
  DebtHistory,
  LicenseCache,
  Notification,
  NotificationLog,
  Payment,
  PaymentHistory,
  Pitak,
  Worker,
  SystemSetting,
];

// @ts-ignore
const AppDataSource = new DataSource({
  ...config,
  entities: entities,
});


AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
  })
  .catch((err) => {
    console.error("Error during Data Source initialization:", err);
  });

module.exports = { AppDataSource };
