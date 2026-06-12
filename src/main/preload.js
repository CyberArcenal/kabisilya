// preload.js - Kabisilya Management System
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("backendAPI", {
  // 📊 Dashboard
  dashboard: (payload) => ipcRenderer.invoke("dashboard", payload),
  // 👥 Core Management Modules
  worker: (payload) => ipcRenderer.invoke("worker", payload),
  assignment: (payload) => ipcRenderer.invoke("assignment", payload),
  bukid: (payload) => ipcRenderer.invoke("bukid", payload),
  pitak: (payload) => ipcRenderer.invoke("pitak", payload),
  debt: (payload) => ipcRenderer.invoke("debt", payload),
  debtHistory: (payload) => ipcRenderer.invoke("debtHistory", payload),
  payment: (payload) => ipcRenderer.invoke("payment", payload),
  paymentHistory: (payload) => ipcRenderer.invoke("paymentHistory", payload),
  attendance: (payload) => ipcRenderer.invoke("attendance", payload),
  activation: (payload) => ipcRenderer.invoke("activation", payload),
  auditLog: (payload) => ipcRenderer.invoke("auditLog", payload),
  notification: (payload) => ipcRenderer.invoke("notification", payload),
  notificationLog: (payload) => ipcRenderer.invoke("notificationLog", payload),
  session: (payload) => ipcRenderer.invoke("session", payload),
  systemConfig: (payload) => ipcRenderer.invoke("systemConfig", payload),
  workerPayment: (payload) => ipcRenderer.invoke("workerPayment", payload),

  // Exports
  auditExport: (payload) => ipcRenderer.invoke("auditExport", payload),
  themes: (payload) => ipcRenderer.invoke("themes", payload),

  // File ops
  openFile: (filePath) => ipcRenderer.invoke("openFile", filePath),
  showItemInFolder: (filePath) =>
    ipcRenderer.invoke("showItemInFolder", filePath),
  getFileInfo: (filePath) => ipcRenderer.invoke("getFileInfo", filePath),
  fileExists: (filePath) => ipcRenderer.invoke("fileExists", filePath),
  openDirectory: (dirPath) => ipcRenderer.invoke("openDirectory", dirPath),
  getFilesInDirectory: (dirPath, extensions) =>
    ipcRenderer.invoke("getFilesInDirectory", dirPath, extensions),
  getRecentExports: (exportDir, limit) =>
    ipcRenderer.invoke("getRecentExports", exportDir, limit),
  deleteFile: (filePath) => ipcRenderer.invoke("deleteFile", filePath),
  copyFileToClipboard: (filePath) =>
    ipcRenderer.invoke("copyFileToClipboard", filePath),

  windowControl: (payload) => ipcRenderer.invoke("window-control", payload),
  notifyAppReady: () => ipcRenderer.send("app:renderer-ready"),
  appInfo: () => ipcRenderer.invoke("app:get-info"),
  openLogFolder: () => ipcRenderer.invoke("app:open-log-folder"),

  openExternal: (url) => ipcRenderer.invoke("open-external", url),
  onWindowMaximized: (callback) =>
    ipcRenderer.on("window:maximized", () => callback()),

  onWindowRestored: (callback) =>
    ipcRenderer.on("window:restored", () => callback()),

  onWindowMinimized: (callback) =>
    ipcRenderer.on("window:minimized", () => callback()),

  onWindowClosed: (callback) =>
    ipcRenderer.on("window:closed", () => callback()),

  onWindowResized: (callback) =>
    ipcRenderer.on("window:resized", (event, bounds) => callback(bounds)),

  onWindowMoved: (callback) =>
    ipcRenderer.on("window:moved", (event, position) => callback(position)),
  updater: (payload) => ipcRenderer.invoke("updater", payload),
  on: (event, callback) => {
    ipcRenderer.on(event, callback);
    return () => ipcRenderer.removeListener(event, callback);
  },
});
