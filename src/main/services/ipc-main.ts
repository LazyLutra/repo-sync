import { ipcMain, dialog } from 'electron'
import { IPC_CHANNELS } from '../../ipc/channel'
import { configStore } from './store'
import { scanRepos, refreshGitStatus } from './scanner'
import { runStep, formatGitCommand } from './git-runner'
import { analyzeEnvironmentDir, readEnvConfig, writeEnvConfig } from './env-scanner'
import { isServiceRunning, startServiceProcess, stopServiceProcess } from './env-process-manager'

// Mocking Workflow interface if not visible here
interface Workflow { id: string; name: string; steps: any[] }

export function registerIpcHandlers() {
  ipcMain.handle(IPC_CHANNELS.SELECT_DIRECTORY, async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    return canceled ? null : filePaths[0]
  })

  ipcMain.handle(IPC_CHANNELS.ANALYZE_ENV_DIR, async (_event, dirPath: string) => {
    if (!dirPath) return null
    return await analyzeEnvironmentDir(dirPath)
  })

  ipcMain.handle(IPC_CHANNELS.READ_ENV_CONFIG, async (_event, filePath: string) => {
    if (!filePath) return ''
    return await readEnvConfig(filePath)
  })

  ipcMain.handle(IPC_CHANNELS.WRITE_ENV_CONFIG, async (_event, filePath: string, content: string) => {
    if (!filePath) return false
    return await writeEnvConfig(filePath, content)
  })

  ipcMain.handle(IPC_CHANNELS.START_ENV_SERVICE, async (_event, payload: { serviceId: string, dirPath: string, startCommand: string }) => {
    return startServiceProcess(payload.serviceId, payload.dirPath, payload.startCommand)
  })

  ipcMain.handle(IPC_CHANNELS.STOP_ENV_SERVICE, async (_event, serviceId: string) => {
    return stopServiceProcess(serviceId)
  })

  ipcMain.handle(IPC_CHANNELS.IS_ENV_SERVICE_RUNNING, async (_event, serviceId: string) => {
    if (!serviceId) return false
    return isServiceRunning(serviceId)
  })

  ipcMain.handle(IPC_CHANNELS.GET_ENV_SERVICES, async () => {
    return configStore.getEnvServices()
  })

  ipcMain.handle(IPC_CHANNELS.SAVE_ENV_SERVICES, async (_event, services: any[]) => {
    configStore.setEnvServices(services)
    return true
  })

  ipcMain.handle(IPC_CHANNELS.SCAN_REPOS, async (_event, rootPath: string) => {
    if (!rootPath) return []
    configStore.setLastRootPath(rootPath)
    return await scanRepos(rootPath)
  })

  ipcMain.handle(IPC_CHANNELS.GET_CONFIG, () => {
    return configStore.getConfig()
  })
  
  ipcMain.handle(IPC_CHANNELS.REFRESH_GIT_STATUS, async (_event, repoPath: string) => {
     return await refreshGitStatus(repoPath)
  })

  ipcMain.handle(IPC_CHANNELS.START_BATCH, async (event, payload: { repoPaths: string[], workflow: Workflow }) => {
    const { repoPaths, workflow } = payload
    const concurrency = configStore.getConfig().concurrency || 3
    
    // Batch process repos with custom concurrency limit
    const results: any[] = []
    const executing = new Set()

    for (const repoPath of repoPaths) {
      const p = Promise.resolve().then(async () => {
        let success = true
        let finalOutput = ''

        for (const step of workflow.steps) {
          const cmdStr = formatGitCommand(step)
          // Broadcast step start
          event.sender.send(IPC_CHANNELS.BATCH_PROGRESS, {
            repoPath,
            stepId: step.id,
            status: 'running',
            commandStr: cmdStr,
            output: '',
            timestamp: Date.now()
          })

          try {
            const stepOut = await runStep(repoPath, step)
            // Broadcast step success
            event.sender.send(IPC_CHANNELS.BATCH_PROGRESS, {
              repoPath,
              stepId: step.id,
              status: 'success',
              commandStr: cmdStr,
              output: stepOut,
              timestamp: Date.now()
            })
            finalOutput += stepOut + '\n'
          } catch (error: any) {
            success = false
            const errorMsg = error.message || String(error)
            // Broadcast step err
            event.sender.send(IPC_CHANNELS.BATCH_PROGRESS, {
              repoPath,
              stepId: step.id,
              status: 'error',
              commandStr: cmdStr,
              output: errorMsg,
              timestamp: Date.now()
            })
            finalOutput += errorMsg + '\n'
            break // stop execution of next workflow steps for this repo on error
          }
        }
        
        results.push({
          repoPath,
          success,
          output: finalOutput
        })
      })

      executing.add(p)
      const clean = () => executing.delete(p)
      p.then(clean).catch(clean)

      if (executing.size >= concurrency) {
        await Promise.race(executing)
      }
    }

    await Promise.all(executing)

    return results
  })
}
