import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface LogEntry {
  repoPath: string
  stepId: string
  status: 'running' | 'success' | 'error'
  output: string
  commandStr?: string
  timestamp: number
}

export const useLogStore = defineStore('log', () => {
  const logs = ref<LogEntry[]>([])

  if (window.electronAPI && window.electronAPI.onBatchProgress) {
    window.electronAPI.onBatchProgress((payload: LogEntry) => {
      const existing = logs.value.find(l => l.repoPath === payload.repoPath && l.stepId === payload.stepId)
      if (existing) {
        existing.status = payload.status
        existing.output = payload.output
        existing.timestamp = payload.timestamp
        if (payload.commandStr) existing.commandStr = payload.commandStr
      } else {
        logs.value.push(payload)
      }
    })
  }

  function clearLogs() {
    logs.value = []
  }

  return {
    logs,
    clearLogs
  }
})
