/**
 * 窗口管理服务
 * 负责创建、销毁和管理应用窗口
 */
import { BrowserWindow } from 'electron'

let mainWindow: BrowserWindow | null = null

export function getMainWindow(): BrowserWindow | null {
  return mainWindow
}

export function setMainWindow(win: BrowserWindow | null) {
  mainWindow = win
}
