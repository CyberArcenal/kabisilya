// src/utils/settings/system.js
//@ts-check
const { logger } = require("../logger");
const { SystemSetting, SettingType } = require("../../entities/systemSettings");
const { AppDataSource } = require("../../main/db/data-source");

// ============================================================
// 📊 CORE GETTER FUNCTIONS
// ============================================================

/**
 * Get setting value
 * @param {string} key
 * @param {string} settingType
 * @param {any} defaultValue
 */
async function getValue(key, settingType, defaultValue = null) {
  try {
    if (typeof key !== "string" || !key.trim()) {
      logger.debug(`[DB] Invalid key: ${key}`);
      return defaultValue;
    }

    const repository = AppDataSource.getRepository(SystemSetting);
    if (!repository) {
      logger.debug(`[DB] Repository not available, using default: ${defaultValue}`);
      return defaultValue;
    }

    const query = repository
      .createQueryBuilder("setting")
      .where("setting.key = :key", { key: key.toLowerCase() })
      .andWhere("setting.is_deleted = :is_deleted", { is_deleted: false });

    if (settingType) {
      query.andWhere("setting.setting_type = :settingType", { settingType });
    }

    const setting = await query.getOne();

    if (!setting || setting.value === null || setting.value === undefined) {
      logger.debug(`[DB] Setting ${key} not found, using default: ${defaultValue}`);
      return defaultValue;
    }

    return String(setting.value).trim();
  } catch (error) {
    logger.warn(`[DB] Error fetching setting ${key}: ${error.message}, using default: ${defaultValue}`);
    return defaultValue;
  }
}

/**
 * Get boolean setting
 */
async function getBool(key, settingType, defaultValue = false) {
  try {
    const raw = await getValue(key, settingType, defaultValue ? "true" : "false");
    if (raw === null) return defaultValue;
    const normalized = String(raw).trim().toLowerCase();
    if (["true", "1", "yes", "y", "on", "enabled", "active"].includes(normalized)) return true;
    if (["false", "0", "no", "n", "off", "disabled", "inactive"].includes(normalized)) return false;
    const num = parseFloat(normalized);
    if (!isNaN(num)) return num > 0;
    logger.warn(`Unrecognized boolean for key='${key}': '${raw}' → using default=${defaultValue}`);
    return defaultValue;
  } catch (error) {
    logger.error(`Error in getBool for ${key}: ${error.message}, using default: ${defaultValue}`);
    return defaultValue;
  }
}

/**
 * Get integer setting
 */
async function getInt(key, settingType, defaultValue = 0) {
  try {
    const raw = await getValue(key, settingType, defaultValue.toString());
    if (raw === null) return defaultValue;
    const result = parseInt(String(raw).trim(), 10);
    return isNaN(result) ? defaultValue : result;
  } catch (error) {
    logger.warn(`Invalid int for key='${key}': ${error.message} – using default=${defaultValue}`);
    return defaultValue;
  }
}

/**
 * Get array setting (stored as JSON string)
 */
async function getArray(key, settingType, defaultValue = []) {
  try {
    const raw = await getValue(key, settingType, JSON.stringify(defaultValue));
    if (raw === null) return defaultValue;
    if (Array.isArray(raw)) return raw;
    if (typeof raw === "string") {
      try { return JSON.parse(raw); } catch { return defaultValue; }
    }
    return defaultValue;
  } catch (error) {
    logger.warn(`Error getting array setting ${key}: ${error.message}, using default`);
    return defaultValue;
  }
}

/**
 * Get a setting by key only (any category)
 */
async function getSystemSetting(key, fallback = null) {
  return getValue(key, null, fallback);
}

// ============================================================
// 🏢 GENERAL SETTINGS
// ============================================================
async function companyName() {
  return getValue("company_name", SettingType.GENERAL, "Collectly");
}
async function branchLocation() {
  return getValue("branch_location", SettingType.GENERAL, "");
}
async function defaultTimezone() {
  return getValue("default_timezone", SettingType.GENERAL, "Asia/Manila");
}
async function currency() {
  return getValue("currency", SettingType.GENERAL, "PHP");
}
async function language() {
  return getValue("language", SettingType.GENERAL, "en");
}
async function receiptFooterMessage() {
  return getValue("receipt_footer_message", SettingType.GENERAL, "");
}
async function autoLogoutMinutes() {
  return getInt("auto_logout_minutes", SettingType.GENERAL, 30);
}
async function dateFormat() {
  return getValue("date_format", SettingType.GENERAL, "YYYY-MM-DD");
}
async function syncMode() {
  return getValue("sync_mode", SettingType.GENERAL, "offline");
}
async function serverUrl() {
  return getValue("server_url", SettingType.GENERAL, "");
}
async function setSyncSettings(mode, url = "") {
  const repository = AppDataSource.getRepository(SystemSetting);
  await repository.upsert(
    [
      { key: "sync_mode", setting_type: SettingType.GENERAL, value: mode, description: "Offline/Online mode for hybrid sync", is_public: true },
      { key: "server_url", setting_type: SettingType.GENERAL, value: url, description: "Server URL for online sync", is_public: true },
    ],
    ["key"]
  );
}

// ============================================================
// 💰 COLLECTIONS SETTINGS
// ============================================================
async function defaultInterestRate() {
  return getInt("default_interest_rate", SettingType.COLLECTIONS, 10);
}
async function defaultPenaltyRate() {
  return getInt("default_penalty_rate", SettingType.COLLECTIONS, 2);
}
async function penaltyCalculationMethod() {
  return getValue("penalty_calculation_method", SettingType.COLLECTIONS, "percentage");
}
async function enableAutoPenalty() {
  return getBool("enable_auto_penalty", SettingType.COLLECTIONS, true);
}
async function penaltyGraceDays() {
  return getInt("penalty_grace_days", SettingType.COLLECTIONS, 0);
}
async function overdueReminderDays() {
  return getArray("overdue_reminder_days", SettingType.COLLECTIONS, [7, 3, 1]);
}
async function maxLoanAmount() {
  return getInt("max_loan_amount", SettingType.COLLECTIONS, 0);
}
async function minLoanAmount() {
  return getInt("min_loan_amount", SettingType.COLLECTIONS, 0);
}
async function enforceCreditCheck() {
  return getBool("enforce_credit_check", SettingType.COLLECTIONS, false);
}
async function defaultInterestCalculationPeriod() {
  return getValue("interest_calculation_period", SettingType.COLLECTIONS, "per_annum");
}
async function creditCheckValidityDays() {
  return getInt("credit_check_validity_days", SettingType.COLLECTIONS, 30);
}
async function minCreditScoreForApproval() {
  return getInt("min_credit_score_for_approval", SettingType.COLLECTIONS, 0);
}

// ============================================================
// 💳 LOANS SETTINGS
// ============================================================
async function amortizationType() {
  return getValue("amortization_type", SettingType.LOANS, "flat");
}
async function defaultLoanTermMonths() {
  return getInt("default_loan_term_months", SettingType.LOANS, 12);
}
async function allowedLoanStatuses() {
  return getArray("allowed_loan_statuses", SettingType.LOANS, ["active", "paid", "overdue", "defaulted"]);
}
async function enablePartialPayment() {
  return getBool("enable_partial_payment", SettingType.LOANS, true);
}
async function enableEarlyPaymentDiscount() {
  return getBool("enable_early_payment_discount", SettingType.LOANS, false);
}
async function earlyPaymentDiscountRate() {
  return getInt("early_payment_discount_rate", SettingType.LOANS, 0);
}
async function requireLoanAgreement() {
  return getBool("require_loan_agreement", SettingType.LOANS, false);
}
async function loanAgreementTemplate() {
  return getValue("loan_agreement_template", SettingType.LOANS, "");
}

// ============================================================
// 🔔 NOTIFICATIONS SETTINGS
// ============================================================
async function emailEnabled() {
  return getBool("email_enabled", SettingType.NOTIFICATIONS, false);
}
async function smsEnabled() {
  return getBool("sms_enabled", SettingType.NOTIFICATIONS, false);
}
async function smsProvider() {
  return getValue("sms_provider", SettingType.NOTIFICATIONS, "twilio");
}
async function reminderDaysBeforeDue() {
  return getArray("reminder_days_before_due", SettingType.NOTIFICATIONS, [7, 3, 1]);
}
async function overdueNotificationFrequency() {
  return getValue("overdue_notification_frequency", SettingType.NOTIFICATIONS, "daily");
}
async function notifyOnPayment() {
  return getBool("notify_on_payment", SettingType.NOTIFICATIONS, true);
}
async function notifyOnPenalty() {
  return getBool("notify_on_penalty", SettingType.NOTIFICATIONS, true);
}

// SMTP Settings
async function smtpHost() {
  return getValue("email_smtp_host", SettingType.NOTIFICATIONS, "");
}
async function smtpPort() {
  return getInt("email_smtp_port", SettingType.NOTIFICATIONS, 587);
}
async function smtpUsername() {
  return getValue("email_smtp_username", SettingType.NOTIFICATIONS, "");
}
async function smtpPassword() {
  return getValue("email_smtp_password", SettingType.NOTIFICATIONS, "");
}
async function smtpFromEmail() {
  return getValue("email_from_address", SettingType.NOTIFICATIONS, "");
}
async function smtpFromName() {
  return getValue("email_from_name", SettingType.NOTIFICATIONS, "");
}
async function getSmtpConfig() {
  const [host, port, username, password, fromEmail, fromName] = await Promise.all([
    smtpHost(), smtpPort(), smtpUsername(), smtpPassword(), smtpFromEmail(), smtpFromName()
  ]);
  return { host, port, username, password, from: { email: fromEmail, name: fromName } };
}

// Twilio SMS Settings
async function twilioAccountSid() {
  return getValue("twilio_account_sid", SettingType.NOTIFICATIONS, "");
}
async function twilioAuthToken() {
  return getValue("twilio_auth_token", SettingType.NOTIFICATIONS, "");
}
async function twilioPhoneNumber() {
  return getValue("twilio_phone_number", SettingType.NOTIFICATIONS, "");
}
async function twilioMessagingServiceSid() {
  return getValue("twilio_messaging_service_sid", SettingType.NOTIFICATIONS, "");
}
async function getTwilioConfig() {
  const [accountSid, authToken, phoneNumber, messagingServiceSid] = await Promise.all([
    twilioAccountSid(), twilioAuthToken(), twilioPhoneNumber(), twilioMessagingServiceSid()
  ]);
  return { accountSid, authToken, phoneNumber, messagingServiceSid };
}

// ============================================================
// 📊 REPORTS SETTINGS
// ============================================================
async function exportFormats() {
  return getArray("export_formats", SettingType.REPORTS, ["CSV", "Excel", "PDF"]);
}
async function defaultExportFormat() {
  return getValue("default_export_format", SettingType.REPORTS, "CSV");
}
async function autoBackupEnabled() {
  return getBool("auto_backup_enabled", SettingType.REPORTS, false);
}
async function backupSchedule() {
  return getValue("backup_schedule", SettingType.REPORTS, "0 2 * * *");
}
async function backupLocation() {
  return getValue("backup_location", SettingType.REPORTS, "./backups");
}
async function dataRetentionDays() {
  return getInt("data_retention_days", SettingType.REPORTS, 365);
}
async function includeAuditInBackup() {
  return getBool("include_audit_in_backup", SettingType.REPORTS, false);
}

// ============================================================
// 🔗 INTEGRATIONS SETTINGS
// ============================================================
async function accountingIntegrationEnabled() {
  return getBool("accounting_integration_enabled", SettingType.INTEGRATIONS, false);
}
async function accountingApiUrl() {
  return getValue("accounting_api_url", SettingType.INTEGRATIONS, "");
}
async function accountingApiKey() {
  return getValue("accounting_api_key", SettingType.INTEGRATIONS, "");
}
async function creditBureauApiEnabled() {
  return getBool("credit_bureau_api_enabled", SettingType.INTEGRATIONS, false);
}
async function creditBureauApiKey() {
  return getValue("credit_bureau_api_key", SettingType.INTEGRATIONS, "");
}
async function creditBureauEndpoint() {
  return getValue("credit_bureau_endpoint", SettingType.INTEGRATIONS, "");
}
async function webhooksEnabled() {
  return getBool("webhooks_enabled", SettingType.INTEGRATIONS, false);
}
async function webhooks() {
  return getArray("webhooks", SettingType.INTEGRATIONS, []);
}

// ============================================================
// 🔒 AUDIT & SECURITY SETTINGS
// ============================================================
async function auditLogEnabled() {
  return getBool("audit_log_enabled", SettingType.AUDIT_SECURITY, true);
}
async function logRetentionDays() {
  return getInt("log_retention_days", SettingType.AUDIT_SECURITY, 30);
}
async function logEvents() {
  return getArray("log_events", SettingType.AUDIT_SECURITY, ["CREATE", "UPDATE", "DELETE", "LOGIN", "LOGOUT"]);
}
async function forceHttps() {
  return getBool("force_https", SettingType.AUDIT_SECURITY, false);
}
async function sessionEncryptionEnabled() {
  return getBool("session_encryption_enabled", SettingType.AUDIT_SECURITY, true);
}
async function gdprComplianceEnabled() {
  return getBool("gdpr_compliance_enabled", SettingType.AUDIT_SECURITY, false);
}
async function requireMfaForAdmin() {
  return getBool("require_mfa_for_admin", SettingType.AUDIT_SECURITY, false);
}

// ============================================================
// 🌾 FARM SESSION SETTINGS (restored)
// ============================================================
async function farmSessionDefaultSessionId() {
  return getInt("default_session_id", SettingType.FARM_SESSION, 0);
}
async function farmSessionSeasonType() {
  return getValue("season_type", SettingType.FARM_SESSION, "tag-ulan");
}
async function farmSessionYear() {
  return getInt("year", SettingType.FARM_SESSION, new Date().getFullYear());
}
async function farmSessionStartDate() {
  return getValue("start_date", SettingType.FARM_SESSION, "");
}
async function farmSessionEndDate() {
  return getValue("end_date", SettingType.FARM_SESSION, "");
}
async function farmSessionStatus() {
  return getValue("status", SettingType.FARM_SESSION, "active");
}
async function farmSessionNotes() {
  return getValue("notes", SettingType.FARM_SESSION, "");
}
async function farmSessionRequireDefaultSession() {
  return getBool("require_default_session", SettingType.FARM_SESSION, true);
}
async function farmSessionAutoClosePrevious() {
  return getBool("auto_close_previous", SettingType.FARM_SESSION, true);
}
async function farmSessionAllowMultipleActiveSessions() {
  return getBool("allow_multiple_active_sessions", SettingType.FARM_SESSION, false);
}

// ============================================================
// 🌾 FARM BUKID SETTINGS
// ============================================================
async function farmBukidNameFormat() {
  return getValue("name_format", SettingType.FARM_BUKID, "Bukid_{number}");
}
async function farmBukidEnableLocationDescriptor() {
  return getBool("enable_location_descriptor", SettingType.FARM_BUKID, true);
}
async function farmBukidAutoDuplicatePerSession() {
  return getBool("auto_duplicate_per_session", SettingType.FARM_BUKID, true);
}
async function farmBukidDefaultStatus() {
  return getValue("default_status", SettingType.FARM_BUKID, "active");
}
async function farmBukidLocationRequired() {
  return getBool("location_required", SettingType.FARM_BUKID, true);
}
async function farmBukidAreaUnit() {
  return getValue("area_unit", SettingType.FARM_BUKID, "hectares");
}
async function farmBukidMaxBukidPerSession() {
  return getInt("max_bukid_per_session", SettingType.FARM_BUKID, 10);
}
async function farmBukidAutoGenerateCode() {
  return getBool("auto_generate_code", SettingType.FARM_BUKID, true);
}
async function farmBukidCodePrefix() {
  return getValue("code_prefix", SettingType.FARM_BUKID, "BKD");
}

// ============================================================
// 📍 FARM PITAK SETTINGS
// ============================================================
async function farmPitakDefaultTotalLuwangCapacity() {
  return getInt("default_total_luwang_capacity", SettingType.FARM_PITAK, 100);
}
async function farmPitakLocationFormat() {
  return getValue("location_format", SettingType.FARM_PITAK, "Pitak_{number}");
}
async function farmPitakStatusOptions() {
  return getArray("status_options", SettingType.FARM_PITAK, ["active", "inactive", "completed"]);
}
async function farmPitakAutoGeneratePitakIds() {
  return getBool("auto_generate_pitak_ids", SettingType.FARM_PITAK, true);
}
async function farmPitakIdPrefix() {
  return getValue("id_prefix", SettingType.FARM_PITAK, "PTK");
}
async function farmPitakMinCapacity() {
  return getInt("min_capacity", SettingType.FARM_PITAK, 1);
}
async function farmPitakMaxCapacity() {
  return getInt("max_capacity", SettingType.FARM_PITAK, 200);
}
async function farmPitakRequireLocation() {
  return getBool("require_location", SettingType.FARM_PITAK, true);
}
async function farmPitakPitakNumberFormat() {
  return getValue("pitak_number_format", SettingType.FARM_PITAK, "{bukid_code}-{sequence}");
}

// ============================================================
// 👨‍🌾 FARM ASSIGNMENT SETTINGS
// ============================================================
async function farmAssignmentDefaultLuwangPerWorker() {
  return getInt("default_luwang_per_worker", SettingType.FARM_ASSIGNMENT, 5);
}
async function farmAssignmentDateBehavior() {
  return getValue("date_behavior", SettingType.FARM_ASSIGNMENT, "system_date");
}
async function farmAssignmentStatusOptions() {
  return getArray("status_options", SettingType.FARM_ASSIGNMENT, ["active", "completed", "cancelled"]);
}
async function farmAssignmentEnableNotesRemarks() {
  return getBool("enable_notes_remarks", SettingType.FARM_ASSIGNMENT, true);
}
async function farmAssignmentAutoAssignBukid() {
  return getBool("auto_assign_bukid", SettingType.FARM_ASSIGNMENT, true);
}
async function farmAssignmentAssignmentDurationDays() {
  return getInt("assignment_duration_days", SettingType.FARM_ASSIGNMENT, 30);
}
async function farmAssignmentAllowReassignment() {
  return getBool("allow_reassignment", SettingType.FARM_ASSIGNMENT, true);
}
async function farmAssignmentMaxWorkersPerPitak() {
  return getInt("max_workers_per_pitak", SettingType.FARM_ASSIGNMENT, 10);
}
async function farmAssignmentRequireAssignmentDate() {
  return getBool("require_assignment_date", SettingType.FARM_ASSIGNMENT, true);
}

// ============================================================
// 💰 FARM PAYMENT SETTINGS
// ============================================================
async function farmPaymentDefaultWageMultiplier() {
  return getValue("default_wage_multiplier", SettingType.FARM_PAYMENT, "1.0");
}
async function farmPaymentDeductionRules() {
  return getValue("deduction_rules", SettingType.FARM_PAYMENT, "manual");
}
async function farmPaymentOtherDeductionsConfig() {
  return getValue("other_deductions_config", SettingType.FARM_PAYMENT, "{}");
}
async function farmPaymentPaymentMethods() {
  return getArray("payment_methods", SettingType.FARM_PAYMENT, ["cash", "gcash"]);
}
async function farmPaymentRequireReferenceNumber() {
  return getBool("require_reference_number", SettingType.FARM_PAYMENT, false);
}
async function farmPaymentStatusOptions() {
  return getArray("status_options", SettingType.FARM_PAYMENT, ["pending", "processing", "completed", "cancelled", "partially_paid"]);
}
async function farmPaymentPaymentTermsDays() {
  return getInt("payment_terms_days", SettingType.FARM_PAYMENT, 15);
}
async function farmPaymentAutoCalculateTotal() {
  return getBool("auto_calculate_total", SettingType.FARM_PAYMENT, true);
}
async function farmPaymentTaxPercentage() {
  return getValue("tax_percentage", SettingType.FARM_PAYMENT, "0");
}
async function farmPaymentRequirePaymentDate() {
  return getBool("require_payment_date", SettingType.FARM_PAYMENT, true);
}
async function farmRatePerLuwang() {
  const value = await getValue("rate_per_luwang", SettingType.FARM_PAYMENT, "230");
  const rate = parseFloat(value);
  if (isNaN(rate) || rate <= 0) {
    throw new Error("Invalid or zero rate_per_luwang. Please set a positive value in system settings.");
  }
  return rate;
}

// ============================================================
// 💳 FARM DEBT SETTINGS
// ============================================================
async function farmDebtDefaultInterestRate() {
  return getValue("default_interest_rate", SettingType.FARM_DEBT, "5");
}
async function farmDebtPaymentTermDays() {
  return getInt("payment_term_days", SettingType.FARM_DEBT, 30);
}
async function farmDebtGracePeriodDays() {
  return getInt("grace_period_days", SettingType.FARM_DEBT, 7);
}
async function farmDebtCarryOverToNextSession() {
  return getBool("carry_over_to_next_session", SettingType.FARM_DEBT, true);
}
async function farmDebtStatusOptions() {
  return getArray("status_options", SettingType.FARM_DEBT, ["pending", "partially_paid", "paid", "cancelled", "overdue"]);
}
async function farmDebtInterestCalculationMethod() {
  return getValue("interest_calculation_method", SettingType.FARM_DEBT, "simple");
}
async function farmDebtCompoundFrequency() {
  return getValue("compound_frequency", SettingType.FARM_DEBT, "monthly");
}
async function farmDebtMaxDebtAmount() {
  return getValue("max_debt_amount", SettingType.FARM_DEBT, "10000");
}
async function farmDebtRequireDebtReason() {
  return getBool("require_debt_reason", SettingType.FARM_DEBT, false);
}
async function farmDebtAutoApplyInterest() {
  return getBool("auto_apply_interest", SettingType.FARM_DEBT, false);
}
async function farmDebtAllocationStrategy() {
  const value = await getValue("debt_allocation_strategy", SettingType.FARM_DEBT, "auto");
  const allowed = ["equal", "proportional", "auto"];
  if (!allowed.includes(value)) {
    throw new Error(`Invalid debt_allocation_strategy setting "${value}". Allowed values: ${allowed.join(", ")}`);
  }
  return value;
}
async function getDebtLimit() {
  const value = await getValue("debt_limit", SettingType.FARM_DEBT, "10000.00");
  const limit = parseFloat(value);
  if (isNaN(limit)) {
    throw new Error("Invalid debt limit. Please check system settings.");
  }
  return limit;
}
async function getDefaultInterestRate() {
  const value = await getValue("default_interest_rate", SettingType.FARM_DEBT, "0");
  const intRate = parseInt(value, 10);
  if (isNaN(intRate)) {
    throw new Error("Invalid default interest rate. Please check system settings.");
  }
  return intRate / 100;
}

// ============================================================
// 📝 FARM AUDIT SETTINGS
// ============================================================
async function farmAuditLogActionsEnabled() {
  return getBool("log_actions_enabled", SettingType.FARM_AUDIT, true);
}
async function farmAuditTrackEntityId() {
  return getBool("track_entity_id", SettingType.FARM_AUDIT, true);
}
async function farmAuditCaptureIpAddress() {
  return getBool("capture_ip_address", SettingType.FARM_AUDIT, false);
}
async function farmAuditCaptureUserAgent() {
  return getBool("capture_user_agent", SettingType.FARM_AUDIT, false);
}
async function farmAuditTieToSession() {
  return getBool("tie_to_session", SettingType.FARM_AUDIT, true);
}
async function farmAuditAuditRetentionDays() {
  return getInt("audit_retention_days", SettingType.FARM_AUDIT, 365);
}
async function farmAuditLogEvents() {
  return getArray("log_events", SettingType.FARM_AUDIT, ["create", "update", "delete"]);
}
async function farmAuditEnableRealTimeLogging() {
  return getBool("enable_real_time_logging", SettingType.FARM_AUDIT, false);
}
async function farmAuditNotifyOnCriticalEvents() {
  return getBool("notify_on_critical_events", SettingType.FARM_AUDIT, false);
}
async function farmAuditCriticalEvents() {
  return getArray("critical_events", SettingType.FARM_AUDIT, ["data_deletion", "system_failure"]);
}

// ============================================================
// 📦 CATEGORY-LEVEL CONVENIENCE FUNCTIONS
// ============================================================
async function getGeneralSettings() {
  const [company_name, branch_location, default_timezone, currency_val, language_val, receipt_footer_message, auto_logout_minutes, date_format] = await Promise.all([
    companyName(), branchLocation(), defaultTimezone(), currency(), language(),
    receiptFooterMessage(), autoLogoutMinutes(), dateFormat()
  ]);
  return { company_name, branch_location, default_timezone, currency: currency_val, language: language_val, receipt_footer_message, auto_logout_minutes, date_format };
}

async function getCollectionsSettings() {
  const [default_interest_rate, default_penalty_rate, penalty_calculation_method, enable_auto_penalty, penalty_grace_days, overdue_reminder_days, max_loan_amount, min_loan_amount, enforce_credit_check, interest_calculation_period] = await Promise.all([
    defaultInterestRate(), defaultPenaltyRate(), penaltyCalculationMethod(),
    enableAutoPenalty(), penaltyGraceDays(), overdueReminderDays(),
    maxLoanAmount(), minLoanAmount(), enforceCreditCheck(), defaultInterestCalculationPeriod()
  ]);
  return { default_interest_rate, default_penalty_rate, penalty_calculation_method, enable_auto_penalty, penalty_grace_days, overdue_reminder_days, max_loan_amount, min_loan_amount, enforce_credit_check, interest_calculation_period };
}

async function getLoansSettings() {
  const [allowed_loan_statuses, enable_partial_payment, enable_early_payment_discount, early_payment_discount_rate, require_loan_agreement, loan_agreement_template, amortization_type, default_loan_term_months] = await Promise.all([
    allowedLoanStatuses(), enablePartialPayment(), enableEarlyPaymentDiscount(),
    earlyPaymentDiscountRate(), requireLoanAgreement(), loanAgreementTemplate(),
    amortizationType(), defaultLoanTermMonths()
  ]);
  return { allowed_loan_statuses, enable_partial_payment, enable_early_payment_discount, early_payment_discount_rate, require_loan_agreement, loan_agreement_template, amortization_type, default_loan_term_months };
}

async function getNotificationsSettings() {
  const [email_enabled, sms_enabled, sms_provider, reminder_days_before_due, overdue_notification_frequency, notify_on_payment, notify_on_penalty] = await Promise.all([
    emailEnabled(), smsEnabled(), smsProvider(),
    reminderDaysBeforeDue(), overdueNotificationFrequency(),
    notifyOnPayment(), notifyOnPenalty()
  ]);
  return { email_enabled, sms_enabled, sms_provider, reminder_days_before_due, overdue_notification_frequency, notify_on_payment, notify_on_penalty };
}

async function getReportsSettings() {
  const [export_formats, default_export_format, auto_backup_enabled, backup_schedule, backup_location, data_retention_days, include_audit_in_backup] = await Promise.all([
    exportFormats(), defaultExportFormat(), autoBackupEnabled(),
    backupSchedule(), backupLocation(), dataRetentionDays(),
    includeAuditInBackup()
  ]);
  return { export_formats, default_export_format, auto_backup_enabled, backup_schedule, backup_location, data_retention_days, include_audit_in_backup };
}

async function getIntegrationsSettings() {
  const [accounting_integration_enabled, accounting_api_url, accounting_api_key, credit_bureau_api_enabled, credit_bureau_api_key, credit_bureau_endpoint, webhooks_enabled, webhooks_array] = await Promise.all([
    accountingIntegrationEnabled(), accountingApiUrl(), accountingApiKey(),
    creditBureauApiEnabled(), creditBureauApiKey(), creditBureauEndpoint(),
    webhooksEnabled(), webhooks()
  ]);
  return { accounting_integration_enabled, accounting_api_url, accounting_api_key, credit_bureau_api_enabled, credit_bureau_api_key, credit_bureau_endpoint, webhooks_enabled, webhooks: webhooks_array };
}

async function getAuditSecuritySettings() {
  const [audit_log_enabled, log_retention_days, log_events, force_https, session_encryption_enabled, gdpr_compliance_enabled, require_mfa_for_admin] = await Promise.all([
    auditLogEnabled(), logRetentionDays(), logEvents(),
    forceHttps(), sessionEncryptionEnabled(),
    gdprComplianceEnabled(), requireMfaForAdmin()
  ]);
  return { audit_log_enabled, log_retention_days, log_events, force_https, session_encryption_enabled, gdpr_compliance_enabled, require_mfa_for_admin };
}

// ============================================================
// 📤 EXPORT
// ============================================================
module.exports = {
  // Core
  getValue,
  getBool,
  getInt,
  getArray,
  getSystemSetting,

  // General
  companyName,
  branchLocation,
  defaultTimezone,
  currency,
  language,
  receiptFooterMessage,
  autoLogoutMinutes,
  dateFormat,
  syncMode,
  serverUrl,
  setSyncSettings,

  // Collections
  defaultInterestRate,
  defaultPenaltyRate,
  penaltyCalculationMethod,
  enableAutoPenalty,
  penaltyGraceDays,
  overdueReminderDays,
  maxLoanAmount,
  minLoanAmount,
  enforceCreditCheck,
  defaultInterestCalculationPeriod,
  creditCheckValidityDays,
  minCreditScoreForApproval,

  // Loans
  amortizationType,
  defaultLoanTermMonths,
  allowedLoanStatuses,
  enablePartialPayment,
  enableEarlyPaymentDiscount,
  earlyPaymentDiscountRate,
  requireLoanAgreement,
  loanAgreementTemplate,

  // Notifications
  emailEnabled,
  smsEnabled,
  smsProvider,
  reminderDaysBeforeDue,
  overdueNotificationFrequency,
  notifyOnPayment,
  notifyOnPenalty,
  smtpHost,
  smtpPort,
  smtpUsername,
  smtpPassword,
  smtpFromEmail,
  smtpFromName,
  getSmtpConfig,
  twilioAccountSid,
  twilioAuthToken,
  twilioPhoneNumber,
  twilioMessagingServiceSid,
  getTwilioConfig,

  // Reports
  exportFormats,
  defaultExportFormat,
  autoBackupEnabled,
  backupSchedule,
  backupLocation,
  dataRetentionDays,
  includeAuditInBackup,

  // Integrations
  accountingIntegrationEnabled,
  accountingApiUrl,
  accountingApiKey,
  creditBureauApiEnabled,
  creditBureauApiKey,
  creditBureauEndpoint,
  webhooksEnabled,
  webhooks,

  // Audit & Security
  auditLogEnabled,
  logRetentionDays,
  logEvents,
  forceHttps,
  sessionEncryptionEnabled,
  gdprComplianceEnabled,
  requireMfaForAdmin,

  // Farm Session
  farmSessionDefaultSessionId,
  farmSessionSeasonType,
  farmSessionYear,
  farmSessionStartDate,
  farmSessionEndDate,
  farmSessionStatus,
  farmSessionNotes,
  farmSessionRequireDefaultSession,
  farmSessionAutoClosePrevious,
  farmSessionAllowMultipleActiveSessions,

  // Farm Bukid
  farmBukidNameFormat,
  farmBukidEnableLocationDescriptor,
  farmBukidAutoDuplicatePerSession,
  farmBukidDefaultStatus,
  farmBukidLocationRequired,
  farmBukidAreaUnit,
  farmBukidMaxBukidPerSession,
  farmBukidAutoGenerateCode,
  farmBukidCodePrefix,

  // Farm Pitak
  farmPitakDefaultTotalLuwangCapacity,
  farmPitakLocationFormat,
  farmPitakStatusOptions,
  farmPitakAutoGeneratePitakIds,
  farmPitakIdPrefix,
  farmPitakMinCapacity,
  farmPitakMaxCapacity,
  farmPitakRequireLocation,
  farmPitakPitakNumberFormat,

  // Farm Assignment
  farmAssignmentDefaultLuwangPerWorker,
  farmAssignmentDateBehavior,
  farmAssignmentStatusOptions,
  farmAssignmentEnableNotesRemarks,
  farmAssignmentAutoAssignBukid,
  farmAssignmentAssignmentDurationDays,
  farmAssignmentAllowReassignment,
  farmAssignmentMaxWorkersPerPitak,
  farmAssignmentRequireAssignmentDate,

  // Farm Payment
  farmPaymentDefaultWageMultiplier,
  farmPaymentDeductionRules,
  farmPaymentOtherDeductionsConfig,
  farmPaymentPaymentMethods,
  farmPaymentRequireReferenceNumber,
  farmPaymentStatusOptions,
  farmPaymentPaymentTermsDays,
  farmPaymentAutoCalculateTotal,
  farmPaymentTaxPercentage,
  farmPaymentRequirePaymentDate,
  farmRatePerLuwang,

  // Farm Debt
  farmDebtDefaultInterestRate,
  farmDebtPaymentTermDays,
  farmDebtGracePeriodDays,
  farmDebtCarryOverToNextSession,
  farmDebtStatusOptions,
  farmDebtInterestCalculationMethod,
  farmDebtCompoundFrequency,
  farmDebtMaxDebtAmount,
  farmDebtRequireDebtReason,
  farmDebtAutoApplyInterest,
  farmDebtAllocationStrategy,
  getDebtLimit,
  getDefaultInterestRate,

  // Farm Audit
  farmAuditLogActionsEnabled,
  farmAuditTrackEntityId,
  farmAuditCaptureIpAddress,
  farmAuditCaptureUserAgent,
  farmAuditTieToSession,
  farmAuditAuditRetentionDays,
  farmAuditLogEvents,
  farmAuditEnableRealTimeLogging,
  farmAuditNotifyOnCriticalEvents,
  farmAuditCriticalEvents,

  // Category groups
  getGeneralSettings,
  getCollectionsSettings,
  getLoansSettings,
  getNotificationsSettings,
  getReportsSettings,
  getIntegrationsSettings,
  getAuditSecuritySettings,
};