// src/types/global.d.ts
export {};

declare global {
  interface Window {
    backendAPI: {
      // 📊 Dashboard
      dashboard: (payload: any) => Promise<any>;
      // 👥 Core Management Modules
      worker: (payload: any) => Promise<any>;
      assignment: (payload: any) => Promise<any>;
      bukid: (payload: any) => Promise<any>;
      pitak: (payload: any) => Promise<any>;
      debt: (payload: any) => Promise<any>;
      debtHistory: (payload: any) => Promise<any>;
      payment: (payload: any) => Promise<any>;
      paymentHistory: (payload: any) => Promise<any>;
      attendance: (payload: any) => Promise<any>;
      activation: (payload: any) => Promise<any>;
      auditLog: (payload: any) => Promise<any>;
      notification: (payload: any) => Promise<any>;
      notificationLog: (payload: any) => Promise<any>;
      session: (payload: any) => Promise<any>;
      systemConfig: (payload: any) => Promise<any>;
      workerPayment: (payload: any) => Promise<any>;
      themes: (payload: any) => Promise<any>;
      reminderLog: (payload: any) => Promise<any>;
      auditExport: (payload: any) => Promise<any>;

      showItemInFolder: (fullPath) => Promise<any>;
      openFile: (filePath) => Promise<any>;
      showItemInFolder: (filePath) => Promise<any>;
      getFileInfo: (filePath) => Promise<any>;
      fileExists: (filePath) => Promise<any>;
      openDirectory: (dirPath) => Promise<any>;
      getFilesInDirectory: (dirPath, extensions) => Promise<any>;
      getRecentExports: (exportDir, limit) => Promise<any>;
      deleteFile: (filePath) => Promise<any>;
      copyFileToClipboard: (filePath) => Promise<any>;

      windowControl: (payload: any) => Promise<any>;

      onWindowMaximized?: (callback: () => void) => void;
      onWindowRestored?: (callback: () => void) => void;
      onWindowMinimized?: (callback: () => void) => void;
      onWindowClosed?: (callback: () => void) => void;
      onWindowResized?: (callback: (bounds: any) => void) => void;
      onWindowMoved?: (callback: (position: any) => void) => void;

      // 🆕 Updater API (invoke)
      updater: (payload: { method: string; params?: any }) => Promise<{
        status: boolean;
        message: string;
        data: any;
      }>;
      notifyAppReady: () => void;

      // 🎧 Generic event listener (returns cleanup function)
      on: (
        channel: string,
        callback: (event: any, ...args: any[]) => void,
      ) => () => void;
      off: (channel: string, callback: (...args: any[]) => void) => void;
    };
  }
}
