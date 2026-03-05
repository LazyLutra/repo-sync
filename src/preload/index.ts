import { ipcRenderer, contextBridge } from 'electron'

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },

  // You can expose other APTs you need here.
  // ...
})

contextBridge.exposeInMainWorld('electronAPI', {
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  analyzeEnvDir: (path: string) => ipcRenderer.invoke('analyze-env-dir', path),
  readEnvConfig: (filePath: string) => ipcRenderer.invoke('read-env-config', filePath),
  writeEnvConfig: (filePath: string, content: string) => ipcRenderer.invoke('write-env-config', filePath, content),
  scanRepos: (path: string) => ipcRenderer.invoke('scan-repos', path),
  getConfig: () => ipcRenderer.invoke('get-config'),
  refreshGitStatus: (path: string) => ipcRenderer.invoke('refresh-git-status', path),
  startBatch: (repoPaths: string[], workflow: any) => ipcRenderer.invoke('start-batch', { repoPaths, workflow }),
  onBatchProgress: (callback: (payload: any) => void) => {
    ipcRenderer.on('batch-progress', (_event, payload) => callback(payload))
  },
  // 环境服务进程管理
  startEnvService: (payload: { serviceId: string, dirPath: string, startCommand: string }) => ipcRenderer.invoke('start-env-service', payload),
  stopEnvService: (serviceId: string) => ipcRenderer.invoke('stop-env-service', serviceId),
  getEnvServices: () => ipcRenderer.invoke('get-env-services'),
  saveEnvServices: (services: any[]) => ipcRenderer.invoke('save-env-services', services),
  onEnvServiceLog: (callback: (payload: any) => void) => {
    ipcRenderer.on('env-service-log', (_event, payload) => callback(payload))
  },
  offEnvServiceLog: () => {
    ipcRenderer.removeAllListeners('env-service-log')
  },
  onEnvServiceExit: (callback: (payload: any) => void) => {
    ipcRenderer.on('env-service-exit', (_event, payload) => callback(payload))
  },
  offEnvServiceExit: () => {
    ipcRenderer.removeAllListeners('env-service-exit')
  },
})
