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

  const isRunning = ref(false)
  const currentStepId = ref<string | null>(null)

  function updateSteps(newSteps: TaskStep[]) {
    currentWorkflow.value.steps = newSteps
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
