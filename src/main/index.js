// src/main/index.js
// @ts-check
/**
 * @file Main entry point for Kabisilya Farm Management System
 * @version 1.0.0
 * @author CyberArcenal
 * @description Electron main process with TypeORM, SQLite, React, and auto-updater
 */

// ===================== CORE IMPORTS =====================
const {
  app,
  ipcMain,
  screen,
  dialog,
  shell,
  protocol,
  BrowserWindow,
} = require("electron");
const path = require("path");
const fs = require("fs").promises;
const fsSync = require("fs");
const url = require("url");

// TypeORM and Database
require("reflect-metadata");
const { AppDataSource } = require("./db/data-source.js");
const MigrationManager = require("../utils/dbUtils/migrationManager");
const { registerImageProtocol } = require("./protocols/imageProtocol.js");
const AuditTrailCleanupScheduler = require("../scheduler/auditTrailCleanupScheduler");
// const OverdueReminderScheduler = require("../scheduler/overdueReminderScheduler.js");
// @ts-ignore
const { logger } = require("../utils/logger.js");
const ipcModules = require("./ipcModules.js");
const InterestAccrualScheduler = require("../scheduler/interestAccrualScheduler.js");

// ===================== CUSTOM PROTOCOLS =====================
protocol.registerSchemesAsPrivileged([
  {
    scheme: "app-image",
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      bypassCSP: true,
    },
  },
  {
    scheme: "agreement-file",
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      bypassCSP: true,
    },
  },
]);

// ===================== TYPE DEFINITIONS =====================
/**
 * @typedef {Object} AppConfig
 * @property {boolean} isDev - Development mode flag
 * @property {string} appName - Application name
 * @property {string} version - App version
 * @property {string} userDataPath - Path to user data directory
 */

// ===================== GLOBAL STATE =====================
/** @type {BrowserWindow | null} */
let mainWindow = null;

/** @type {BrowserWindow | null} */
let splashWindow = null;

/** @type {boolean} */
let isDatabaseInitialized = false;

/** @type {boolean} */
let isShuttingDown = false;

/** @type {MigrationManager | null} */
let migrationManager = null;

/** @type {AppConfig} */
const APP_CONFIG = {
  isDev: process.env.NODE_ENV === "development" || !app.isPackaged,
  appName: "Kabisilya",
  version: app.getVersion(),
  userDataPath: app.getPath("userData"),
};

// ===================== LOGGING SERVICE =====================
const LogLevel = {
  DEBUG: "DEBUG",
  INFO: "INFO",
  WARN: "WARN",
  ERROR: "ERROR",
  SUCCESS: "SUCCESS",
};

// @ts-ignore
async function log(level, message, data = null, writeToFile = false) {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${APP_CONFIG.appName} ${level}]`;
  const logMessage = `${prefix} ${message}`;

  if (APP_CONFIG.isDev) {
    const colors = {
      [LogLevel.DEBUG]: "\x1b[36m",
      [LogLevel.INFO]: "\x1b[34m",
      [LogLevel.WARN]: "\x1b[33m",
      [LogLevel.ERROR]: "\x1b[31m",
      [LogLevel.SUCCESS]: "\x1b[32m",
    };
    console.log(`${colors[level] || ""}${logMessage}\x1b[0m`);
  } else {
    console.log(logMessage);
  }
  if (data) console.dir(data, { depth: 3, colors: APP_CONFIG.isDev });

  if (writeToFile && !APP_CONFIG.isDev) {
    try {
      const logDir = path.join(APP_CONFIG.userDataPath, "logs");
      await fs.mkdir(logDir, { recursive: true });
      const logFile = path.join(
        logDir,
        `Kabisilya-${new Date().toISOString().split("T")[0]}.log`,
      );
      const logEntry = `${logMessage}${
        data ? "\n" + JSON.stringify(data, null, 2) : ""
      }\n`;
      await fs.appendFile(logFile, logEntry);
    } catch (error) {
      console.error("Failed to write log to file:", error);
    }
  }
}

// ===================== ERROR HANDLING =====================
function setupGlobalErrorHandlers() {
  process.on("uncaughtException", (error) => {
    // @ts-ignore
    log(LogLevel.ERROR, "Uncaught Exception:", error, true);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("app:error", {
        type: "uncaughtException",
        message: error.message,
      });
    }
  });
  process.on("unhandledRejection", (reason) => {
    // @ts-ignore
    log(LogLevel.ERROR, "Unhandled Rejection:", reason, true);
  });
  // @ts-ignore
  app.on("renderer-process-crashed", (event, webContents, killed) => {
    log(
      LogLevel.ERROR,
      "Renderer crashed:",
      // @ts-ignore
      { killed, webContentsId: webContents.id },
      true,
    );
  });
}

// ===================== DATABASE SERVICE =====================
async function initializeDatabase() {
  try {
    log(LogLevel.INFO, "Initializing database...");
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      log(LogLevel.SUCCESS, "Database connected");
    }
    migrationManager = new MigrationManager(AppDataSource);
    const status = await migrationManager.getMigrationStatus();
    if (status.needsMigration) {
      log(
        LogLevel.INFO,
        `Found ${status.pending} pending migration(s). Running now...`,
      );
      if (splashWindow && !splashWindow.isDestroyed()) {
        splashWindow.webContents.send("migration:status", {
          status: "running",
          message: "Updating database structure...",
        });
      }
      const result = await migrationManager.runMigrations();
      if (result.success) {
        log(LogLevel.SUCCESS, result.message);
        if (splashWindow) {
          splashWindow.webContents.send("migration:status", {
            status: "completed",
            message: result.message,
          });
        }
      } else {
        log(LogLevel.ERROR, "Migration failed:", result.error);
        if (splashWindow && !splashWindow.isDestroyed()) {
          splashWindow.webContents.send("migration:status", {
            status: "failed",
            message: "Database update failed. Continuing with existing schema.",
          });
        }
        dialog.showMessageBoxSync({
          type: "info",
          title: "Migration Warning",
          message: "Database update had an issue",
          detail: result.message + "\n\nContinuing with current schema.",
          buttons: ["OK"],
        });
      }
    } else {
      log(LogLevel.INFO, "Database is up to date ✅");
    }
    isDatabaseInitialized = true;
    return { success: true };
  } catch (error) {
    // @ts-ignore
    log(LogLevel.ERROR, "Database init failed:", error);
    try {
      await AppDataSource.synchronize(false);
      log(LogLevel.WARN, "Used fallback synchronize");
      isDatabaseInitialized = true;
      return { success: true, fallback: true };
    } catch (e) {
      // @ts-ignore
      return { success: false, error: e.message };
    }
  }
}

async function safeCloseDatabase() {
  if (isShuttingDown) return;
  isShuttingDown = true;
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      log(LogLevel.INFO, "Database connection closed gracefully");
      isDatabaseInitialized = false;
    }
  } catch (error) {
    // @ts-ignore
    log(LogLevel.ERROR, "Error closing database connection:", error);
  }
}

// ===================== WINDOW MANAGEMENT =====================
function getIconPath() {
  const platform = process.platform;
  const iconDir = APP_CONFIG.isDev
    ? path.resolve(__dirname, "..", "..", "icons")
    : path.join(process.resourcesPath, "icons");
  const iconMap = { win32: "icon.ico", darwin: "icon.icns", linux: "icon.png" };
  // @ts-ignore
  const iconFile = iconMap[platform] || "icon.png";
  const iconPath = path.join(iconDir, iconFile);
  return fsSync.existsSync(iconPath) ? iconPath : null;
}

async function createSplashWindow() {
  try {
    log(LogLevel.INFO, "Creating splash window...");
    const splashConfig = {
      width: 500,
      height: 400,
      transparent: true,
      frame: false,
      alwaysOnTop: true,
      center: true,
      resizable: false,
      movable: true,
      skipTaskbar: true,
      show: false,
      backgroundColor: "#00000000",
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, "preload.js"),
      },
    };
    splashWindow = new BrowserWindow(splashConfig);
    const splashPath = path.join(__dirname, "splash.html");
    if (!fsSync.existsSync(splashPath)) {
      throw new Error("Splash HTML file not found");
    }
    await splashWindow.loadFile(splashPath);
    splashWindow.show();
    log(LogLevel.SUCCESS, "Splash window created");
    return splashWindow;
  } catch (error) {
    // @ts-ignore
    throw new Error(`Failed to create splash window: ${error.message}`);
  }
}

async function getAppUrl() {
  if (APP_CONFIG.isDev) {
    return "http://localhost:5173";
  }
  const possiblePaths = [
    path.join(__dirname, "..", "..", "dist", "renderer", "index.html"),
    path.join(process.resourcesPath, "app.asar.unpacked", "dist", "index.html"),
    path.join(process.resourcesPath, "dist", "index.html"),
    path.join(app.getAppPath(), "dist", "index.html"),
  ];
  for (const filePath of possiblePaths) {
    try {
      await fs.access(filePath);
      return url.pathToFileURL(filePath).href;
    } catch {
      continue;
    }
  }
  throw new Error(
    `Production build not found. Checked paths:\n${possiblePaths.join("\n")}`,
  );
}

async function createMainWindow() {
  try {
    log(LogLevel.INFO, "Creating main window...");
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } =
      primaryDisplay.workAreaSize;
    const windowWidth = Math.min(1366, screenWidth - 100);
    const windowHeight = Math.min(768, screenHeight - 100);
    const x = Math.floor((screenWidth - windowWidth) / 2);
    const y = Math.floor((screenHeight - windowHeight) / 2);

    const windowConfig = {
      width: windowWidth,
      height: windowHeight,
      x,
      y,
      minWidth: 1024,
      minHeight: 768,
      show: false,
      frame: true,
      titleBarStyle: "default",
      backgroundColor: "#f0f7f0",
      icon: getIconPath(),
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: !APP_CONFIG.isDev,
        sandbox: true,
      },
    };
    // @ts-ignore
    mainWindow = new BrowserWindow(windowConfig);
    mainWindow.setMenuBarVisibility(false);
    mainWindow.setTitle(`${APP_CONFIG.appName} v${APP_CONFIG.version}`);

    let isSplashClosed = false;
    const closeSplashAndShowMain = () => {
      if (isSplashClosed) return;
      isSplashClosed = true;
      if (splashWindow && !splashWindow.isDestroyed()) {
        splashWindow.close();
        splashWindow = null;
      }
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.show();
        mainWindow.focus();
        log(LogLevel.SUCCESS, "Main window shown after renderer ready");
      }
    };

    mainWindow.once("ready-to-show", () => {
      log(
        LogLevel.INFO,
        "Main window ready-to-show, waiting for renderer-ready signal...",
      );
      const timeoutId = setTimeout(() => {
        log(
          LogLevel.WARN,
          "Renderer-ready timeout reached, closing splash anyway",
        );
        closeSplashAndShowMain();
      }, 8000);
      ipcMain.once("app:renderer-ready", (event) => {
        // @ts-ignore
        if (event.sender === mainWindow.webContents) {
          log(LogLevel.INFO, "Received renderer-ready signal from React app");
          clearTimeout(timeoutId);
          closeSplashAndShowMain();
        }
      });
    });

    const appUrl = await getAppUrl();
    await mainWindow.loadURL(appUrl);
    if (APP_CONFIG.isDev)
      mainWindow.webContents.openDevTools({ mode: "detach" });

    mainWindow.webContents.on("did-finish-load", () => {
      // @ts-ignore
      mainWindow.webContents.send("app:database-status", {
        initialized: isDatabaseInitialized,
      });
    });

    try {
      const updaterModule = require("./ipc/utils/updater/index.ipc.js");
      updaterModule.setMainWindow(mainWindow);
      log(LogLevel.INFO, "Updater handler attached");
    } catch (e) {
      // @ts-ignore
      log(LogLevel.WARN, "Failed to set updater main window", e);
    }
    return mainWindow;
  } catch (error) {
    // @ts-ignore
    throw new Error(`Failed to create main window: ${error.message}`);
  }
}

// @ts-ignore
function showErrorPage(window, title, message, details = "") {
  const errorHTML = `
    <!DOCTYPE html><html><head><meta charset="UTF-8"><title>${title} - ${APP_CONFIG.appName}</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: linear-gradient(135deg, #1a3c1a 0%, #0d260d 100%);
        color: #f5f5f5;
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
        padding: 40px;
        margin: 0;
      }
      .error-container {
        max-width: 600px;
        background: rgba(74, 112, 49, 0.15);
        padding: 40px;
        border-radius: 20px;
        backdrop-filter: blur(10px);
        box-shadow: 0 8px 32px rgba(74, 112, 49, 0.2);
      }
      h1 { margin-bottom: 20px; font-size: 28px; color: #f9a825; }
      .message { font-size: 16px; line-height: 1.6; margin-bottom: 30px; }
      .details { background: rgba(0,0,0,0.4); padding: 15px; border-radius: 10px; font-family: monospace; font-size: 12px; text-align: left; overflow: auto; max-height: 200px; margin: 20px 0; }
      .button-group { display: flex; gap: 15px; justify-content: center; margin-top: 30px; }
      button { padding: 12px 24px; border: none; border-radius: 25px; font-weight: bold; cursor: pointer; min-width: 120px; }
      .retry-btn { background: #f9a825; color: #000; }
      .close-btn { background: #ff4c4c; color: #fff; }
      .logo { font-size: 24px; font-weight: bold; margin-bottom: 20px; color: #f9a825; }
    </style></head>
    <body><div class="error-container">
      <div class="logo">${APP_CONFIG.appName}</div>
      <h1>⚠️ ${title}</h1>
      <div class="message">${message}</div>
      ${details ? `<div class="details">${details}</div>` : ""}
      <div class="button-group">
        <button class="retry-btn" onclick="window.location.reload()">Retry</button>
        <button class="close-btn" onclick="window.close()">Close</button>
      </div>
      <div style="margin-top:20px;font-size:12px;">v${APP_CONFIG.version} • ${APP_CONFIG.isDev ? "Development" : "Production"}</div>
    </div></body></html>
  `;
  window.loadURL(
    `data:text/html;charset=utf-8,${encodeURIComponent(errorHTML)}`,
  );
}

// ===================== IPC HANDLERS (FARM MANAGEMENT ONLY) =====================
function registerIpcHandlers() {
  log(LogLevel.INFO, "Registering IPC handlers...");

  // Window controls
  ipcMain.on("window:minimize", () => mainWindow?.minimize());
  ipcMain.on("window:maximize", () =>
    // @ts-ignore
    mainWindow?.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize(),
  );
  ipcMain.on("window:close", () => mainWindow?.close());
  ipcMain.on("window:reload", () => mainWindow?.reload());
  ipcMain.on("window:toggle-devtools", () =>
    mainWindow?.webContents.toggleDevTools(),
  );

  // App info
  ipcMain.handle("app:get-info", () => ({
    name: APP_CONFIG.appName,
    version: APP_CONFIG.version,
    isDev: APP_CONFIG.isDev,
    platform: process.platform,
    arch: process.arch,
    userDataPath: APP_CONFIG.userDataPath,
    databaseReady: isDatabaseInitialized,
  }));

  // @ts-ignore
  ipcMain.on("app:open-external", (event, url) => {
    if (typeof url === "string" && url.startsWith("http"))
      shell.openExternal(url).catch(console.error);
  });

  // Database
  ipcMain.handle("database:get-status", async () => {
    const isInitialized = AppDataSource.isInitialized;
    const migrationStatus = migrationManager
      ? await migrationManager.getMigrationStatus()
      : null;
    return {
      initialized: isInitialized,
      migrationManager: !!migrationManager,
      migrationStatus,
    };
  });
  ipcMain.handle("database:backup", async () => {
    if (!migrationManager) throw new Error("Migration manager not initialized");
    const backupPath = await migrationManager.backupDatabase();
    return { success: true, backupPath };
  });

  ipcModules.forEach((modulePath) => {
    try {
      const fullPath = path.join(__dirname, modulePath);
      if (fsSync.existsSync(fullPath)) {
        require(fullPath);
        log(LogLevel.DEBUG, `Loaded IPC module: ${modulePath}`);
      } else {
        log(LogLevel.WARN, `IPC module not found: ${modulePath}`);
      }
    } catch (error) {
      // @ts-ignore
      log(LogLevel.ERROR, `Failed to load IPC module ${modulePath}:`, error);
    }
  });

  log(LogLevel.SUCCESS, "All IPC handlers registered");
}

// ===================== MAIN STARTUP SEQUENCE =====================
async function startupSequence() {
  try {
    log(
      LogLevel.INFO,
      `🚀 Starting ${APP_CONFIG.appName} v${APP_CONFIG.version}...`,
    );
    log(
      LogLevel.INFO,
      `Environment: ${APP_CONFIG.isDev ? "Development" : "Production"}`,
    );
    log(LogLevel.INFO, `User Data Path: ${APP_CONFIG.userDataPath}`);
    setupGlobalErrorHandlers();
    await createSplashWindow();
    registerImageProtocol();

    const dbResult = await initializeDatabase();
    if (!dbResult.success) {
      const userChoice = dialog.showMessageBoxSync({
        type: "info",
        title: "Database Warning",
        message: "Database initialization failed",
        detail: `${dbResult.error}\n\nApplication may have limited functionality.`,
        buttons: ["Continue Anyway", "Quit Application"],
        defaultId: 0,
      });
      if (userChoice === 1) {
        log(LogLevel.INFO, "User chose to quit due to database error");
        app.quit();
        return;
      }
    }

    registerIpcHandlers();
    await createMainWindow();
    log(LogLevel.SUCCESS, `✅ ${APP_CONFIG.appName} started successfully!`);

    // Start background schedulers (farm-specific)
    const auditCleaner = new AuditTrailCleanupScheduler();
    auditCleaner.start();
    // const reminderScheduler = new OverdueReminderScheduler();
    // reminderScheduler.start().catch(err => log(LogLevel.ERROR, "Failed to start Overdue Reminder Scheduler", err));

    const interestAccrualScheduler = new InterestAccrualScheduler();
    interestAccrualScheduler.start().catch((err) => {
      logger.error(
        LogLevel.ERROR,
        "Failed to start Interest Accrual Scheduler",
        // @ts-ignore
        err,
      );
    });
  } catch (error) {
    // @ts-ignore
    log(LogLevel.ERROR, "Startup sequence failed:", error);
    if (splashWindow && !splashWindow.isDestroyed()) splashWindow.close();
    const errorWindow = new BrowserWindow({
      width: 800,
      height: 600,
      show: false,
      webPreferences: { contextIsolation: false, nodeIntegration: true },
    });
    showErrorPage(
      errorWindow,
      "Startup Failed",
      "The application failed to start properly.",
      // @ts-ignore
      error.message,
    );
    errorWindow.show();
  }
}

// @ts-ignore
ipcMain.handle("open-external", async (event, url) => shell.openExternal(url));

// ===================== APP EVENT HANDLERS =====================
app.on("ready", startupSequence);
app.on("window-all-closed", async () => {
  log(LogLevel.INFO, "All windows closed");
  await safeCloseDatabase();
  if (process.platform !== "darwin") app.quit();
});
app.on("activate", async () => {
  if (BrowserWindow.getAllWindows().length === 0) await startupSequence();
});
app.on("before-quit", async (event) => {
  if (!isShuttingDown) {
    event.preventDefault();
    await safeCloseDatabase();
    app.quit();
  }
});

// ===================== EXPORTS FOR TESTING =====================
if (APP_CONFIG.isDev) {
  module.exports = {
    APP_CONFIG,
    getIconPath,
    initializeDatabase,
    createMainWindow,
    safeCloseDatabase,
    log,
  };
}
