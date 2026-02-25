<script setup lang="ts">
import { useWorkflowStore } from "../../store/useWorkflowStore";
import { useLogStore } from "../../store/useLogStore";
import { useRepoStore } from "../../store/useRepoStore";
import { ref, computed, h } from "vue";
import { Button, Steps, Step, Card, Space } from "ant-design-vue";
import {
  SettingOutlined,
  PlayCircleOutlined,
  LoadingOutlined,
} from "@ant-design/icons-vue";
import WorkflowEditor from "./WorkflowEditor.vue";

const workflowStore = useWorkflowStore();
const logStore = useLogStore();
const repoStore = useRepoStore();

const isEditorOpen = ref(false);

const currentStepIndex = computed(() => {
  if (!workflowStore.currentStepId) return -1;
  return workflowStore.currentWorkflow.steps.findIndex(
    (s) => s.id === workflowStore.currentStepId,
  );
});

async function runWorkflow() {
  if (workflowStore.isRunning) return;

  const selectedRepos = repoStore.repos.filter((r) => r.selected);
  if (selectedRepos.length === 0) {
    console.error("No repositories selected.");
    return;
  }

  workflowStore.setRunning(true);
  logStore.clearLogs();

  const repoPaths = selectedRepos.map((r) => r.path);

  try {
    const results = await window.electronAPI.startBatch(
      repoPaths,
      JSON.parse(JSON.stringify(workflowStore.currentWorkflow)),
    );
    const allSuccess = results.every((r: any) => r.success);
    if (!allSuccess) {
      console.warn("Some repositories failed to execute completely.");
    }

    // Save history branch configurations to localStorage for Autocomplete
    const branches = new Set<string>(
      JSON.parse(localStorage.getItem("repoSync_branches") || "[]"),
    );
    workflowStore.currentWorkflow.steps.forEach((step) => {
      if (step.type === "git-checkout" && step.params.branch)
        branches.add(step.params.branch as string);
      if (step.type === "git-merge") {
        if (step.params.targetBranch)
          branches.add(step.params.targetBranch as string);
        if (step.params.sourceBranch)
          branches.add(step.params.sourceBranch as string);
      }
    });
    localStorage.setItem(
      "repoSync_branches",
      JSON.stringify(Array.from(branches)),
    );

    // Refresh the local git status so UI immediately bumps the new branch
    Promise.allSettled(selectedRepos.map((r) => repoStore.refreshGitStatus(r)));
  } catch (error) {
    console.error("Batch execution failed:", error);
  } finally {
    workflowStore.setRunning(false);
    workflowStore.setCurrentStep(null);
  }
}
</script>

<template>
  <Card title="Workflow Configuration" :bordered="false">
    <template #extra>
      <Space>
        <Button
          :disabled="workflowStore.isRunning"
          @click="isEditorOpen = true"
        >
          <template #icon><SettingOutlined /></template>
          Edit
        </Button>
        <Button
          type="primary"
          :loading="workflowStore.isRunning"
          @click="runWorkflow"
        >
          <template #icon><PlayCircleOutlined /></template>
          Start Execution
        </Button>
      </Space>
    </template>

    <div class="steps-container">
      <Steps
        :current="currentStepIndex"
        status="process"
        size="small"
        class="custom-steps"
      >
        <Step
          v-for="step in workflowStore.currentWorkflow.steps"
          :key="step.id"
          :title="step.type"
          :icon="
            workflowStore.currentStepId === step.id
              ? h(LoadingOutlined)
              : undefined
          "
        />
      </Steps>
    </div>

    <WorkflowEditor :is-open="isEditorOpen" @close="isEditorOpen = false" />
  </Card>
</template>

<style scoped>
.steps-container {
  padding: 16px 24px;
  background: #fdfdfd;
  border-radius: 8px;
  border: 1px dashed rgba(0, 0, 0, 0.08);
}
:deep(.ant-steps) {
  flex-wrap: wrap;
}
:deep(.ant-steps-item) {
  min-width: 140px;
  margin-bottom: 8px;
  max-width: 240px;
  flex: 1 1 auto;
}
:deep(.ant-steps-item-title) {
  font-size: 13px !important;
  font-weight: 500;
}
</style>
