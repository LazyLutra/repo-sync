import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Workflow, TaskStep } from '../../../shared/types'

export const useWorkflowStore = defineStore('workflow', () => {
  const currentWorkflow = ref<Workflow>({
    id: 'default-workflow',
    name: 'Default Workflow',
    steps: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  })

  // @ts-ignore
  if (window.electronAPI && window.electronAPI.getWorkflow) {
    // @ts-ignore
    window.electronAPI.getWorkflow().then((saved: any) => {
      if (saved && saved.steps) {
        currentWorkflow.value = saved
      }
    }).catch((err: any) => console.error("Failed to load workflow", err))
  }



  const isRunning = ref(false)
  const currentStepId = ref<string | null>(null)

  function updateSteps(newSteps: TaskStep[]) {
    currentWorkflow.value.steps = newSteps
    // @ts-ignore
    if (window.electronAPI && window.electronAPI.saveWorkflow) {
      // @ts-ignore
      window.electronAPI.saveWorkflow(JSON.parse(JSON.stringify(currentWorkflow.value)))
        .catch((err: any) => console.error("Failed to save workflow", err))
    }
  }

  function setRunning(running: boolean) {
    isRunning.value = running
  }

  function setCurrentStep(stepId: string | null) {
    currentStepId.value = stepId
  }

  return {
    currentWorkflow,
    isRunning,
    currentStepId,
    updateSteps,
    setRunning,
    setCurrentStep
  }
})
