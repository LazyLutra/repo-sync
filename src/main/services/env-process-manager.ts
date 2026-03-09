import { spawn, ChildProcess } from 'node:child_process'
import { BrowserWindow } from 'electron'
import { IPC_CHANNELS } from '../../ipc/channel'

// 管理所有正在运行的环境服务子进程
const runningProcesses = new Map<string, ChildProcess>()

/**
 * 启动一个环境服务的子进程
 * @param serviceId 服务 ID（用于标识和管理进程）
 * @param dirPath 服务所在目录
 * @param startCommand 启动命令（如 "startup.cmd -m standalone"）
 */
export function startServiceProcess(serviceId: string, dirPath: string, startCommand: string): boolean {
  // 如果该服务已经有运行中的进程，先停止
  if (runningProcesses.has(serviceId)) {
    stopServiceProcess(serviceId)
  }

  const parts = startCommand.split(/\s+/)
  const cmd = parts[0]
  const args = parts.slice(1)

  try {
    const child = spawn(cmd, args, {
      cwd: dirPath,
      shell: true,
      // 在 Windows 上使用 cmd.exe 运行
      windowsHide: true,
      env: { ...process.env },
    })

    runningProcesses.set(serviceId, child)

    const sendLog = (data: string, stream: 'stdout' | 'stderr') => {
      const wins = BrowserWindow.getAllWindows()
      if (wins.length === 0) return

      // 按行分割输出，过滤空行
      const lines = data.split(/\r?\n/).filter(line => line.trim().length > 0)
      for (const line of lines) {
        wins[0].webContents.send(IPC_CHANNELS.ENV_SERVICE_LOG, {
          serviceId,
          message: line,
          stream,
          timestamp: Date.now(),
        })
      }
    }

    child.stdout?.on('data', (data: Buffer) => {
      sendLog(data.toString('utf-8'), 'stdout')
    })

    child.stderr?.on('data', (data: Buffer) => {
      sendLog(data.toString('utf-8'), 'stderr')
    })

    child.on('error', (err) => {
      const wins = BrowserWindow.getAllWindows()
      if (wins.length > 0) {
        wins[0].webContents.send(IPC_CHANNELS.ENV_SERVICE_EXIT, {
          serviceId,
          code: -1,
          error: err.message,
        })
      }
      runningProcesses.delete(serviceId)
    })

    child.on('exit', (code, signal) => {
      const wins = BrowserWindow.getAllWindows()
      if (wins.length > 0) {
        wins[0].webContents.send(IPC_CHANNELS.ENV_SERVICE_EXIT, {
          serviceId,
          code: code ?? -1,
          signal: signal ?? undefined,
        })
      }
      runningProcesses.delete(serviceId)
    })

    return true
  } catch (error) {
    console.error(`Failed to start service ${serviceId}:`, error)
    return false
  }
}

/**
 * 停止一个正在运行的环境服务子进程
 */
export function stopServiceProcess(serviceId: string): boolean {
  const child = runningProcesses.get(serviceId)
  if (!child) return false

  try {
    // Windows 上需要用 taskkill 杀死整个进程树
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', String(child.pid), '/f', '/t'], { shell: true })
    } else {
      child.kill('SIGTERM')
    }
    runningProcesses.delete(serviceId)
    return true
  } catch (error) {
    console.error(`Failed to stop service ${serviceId}:`, error)
    return false
  }
}

/**
 * 检查某服务是否正在运行
 */
export function isServiceRunning(serviceId: string): boolean {
  return runningProcesses.has(serviceId)
}

/**
 * 是否存在正在运行的服务
 */
export function hasRunningServices(): boolean {
  return runningProcesses.size > 0
}

/**
 * 获取正在运行的服务数量
 */
export function getRunningServiceCount(): number {
  return runningProcesses.size
}

/**
 * 停止所有正在运行的服务
 * @returns 实际尝试停止的服务数量
 */
export function stopAllServiceProcesses(): number {
  const serviceIds = Array.from(runningProcesses.keys())
  for (const serviceId of serviceIds) {
    stopServiceProcess(serviceId)
  }
  return serviceIds.length
}
