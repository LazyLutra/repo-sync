import { ipcMain, dialog } from 'electron'
import { IPC_CHANNELS } from '../../ipc/channel'
import { configStore } from './store'
import { scanRepos, refreshGitStatus } from './scanner'
import { runStep, formatGitCommand } from './git-runner'

// Mocking Workflow interface if not visible here
interface Workflow { id: string; name: string; steps: any[] }

export function registerIpcHandlers() {
  ipcMain.handle(IPC_CHANNELS.SELECT_DIRECTORY, async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    return canceled ? null : filePaths[0]
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
