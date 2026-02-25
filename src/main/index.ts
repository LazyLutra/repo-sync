import { app, BrowserWindow } from "electron";

// Disable security warnings in development
if (process.env.NODE_ENV === "development" || process.env.VITE_DEV_SERVER_URL) {
  process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = "true";
}
import { fileURLToPath } from "node:url";
import path from "node:path";

// Fix disk cache permission errors on Windows
app.commandLine.appendSwitch(
  "disk-cache-dir",
  path.join(app.getPath("userData"), "cache"),
);
app.commandLine.appendSwitch(
  "gpu-disk-cache-dir",
  path.join(app.getPath("userData"), "gpu-cache"),
);

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, "..");

// Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

let win: BrowserWindow | null;

async function waitForDevServer(
  url: string,
  maxRetries = 30,
  interval = 500,
): Promise<void> {
  const { net } = await import("electron");
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await net.fetch(url, { method: "HEAD" });
      if (response.ok || response.status < 500) return;
    } catch {
      // Dev server not ready yet, keep retrying
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
  throw new Error(
    `Dev server at ${url} did not start within ${(maxRetries * interval) / 1000}s`,
  );
}

async function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "icon.png"),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "index.mjs"),
    },
  });

  // Open the DevTools if in development mode.
  if (VITE_DEV_SERVER_URL) {
    // win.webContents.openDevTools();
  }

  // Allow F12 to toggle DevTools
  win.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12') {
      if (win?.webContents.isDevToolsOpened()) {
        win.webContents.closeDevTools();
      } else {
        win?.webContents.openDevTools();
      }
      event.preventDefault();
    }
  });

  // Test active push message to Renderer-process.
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    await waitForDevServer(VITE_DEV_SERVER_URL);
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

import { registerIpcHandlers } from "./services/ipc-main";

app.whenReady().then(() => {
  registerIpcHandlers();
  createWindow();
});
