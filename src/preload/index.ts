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
  scanRepos: (path: string) => ipcRenderer.invoke('scan-repos', path),
  getConfig: () => ipcRenderer.invoke('get-config'),
  refreshGitStatus: (path: string) => ipcRenderer.invoke('refresh-git-status', path),
  startBatch: (repoPaths: string[], workflow: any) => ipcRenderer.invoke('start-batch', { repoPaths, workflow }),
  onBatchProgress: (callback: (payload: any) => void) => {
    ipcRenderer.on('batch-progress', (_event, payload) => callback(payload))
  }
})
