<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useWorkflowStore } from "../../store/useWorkflowStore";
import type { TaskStep } from "../../../../shared/types";
import {
  Modal,
  Input,
  Button,
  Space,
  Select,
  AutoComplete,
  List,
  ListItem,
} from "ant-design-vue";
import {
  DeleteOutlined,
  PlusOutlined,
  MenuOutlined,
} from "@ant-design/icons-vue";

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const workflowStore = useWorkflowStore();
const editingSteps = ref<TaskStep[]>([]);
const historyBranches = ref<{ value: string }[]>([]);

onMounted(() => {
  const stored = JSON.parse(localStorage.getItem("repoSync_branches") || "[]");
  historyBranches.value = stored.map((b: string) => ({ value: b }));
});

const stepTypes = [
  { value: "git-pull", label: "Git Pull" },
  { value: "git-push", label: "Git Push" },
  { value: "git-fetch", label: "Git Fetch" },
  { value: "git-checkout", label: "Git Checkout" },
  { value: "git-merge", label: "Git Merge" },
  { value: "custom-command", label: "Custom Cmd" },
];

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      editingSteps.value = JSON.parse(
        JSON.stringify(workflowStore.currentWorkflow.steps),
      );
      const stored = JSON.parse(
        localStorage.getItem("repoSync_branches") || "[]",
      );
      historyBranches.value = stored.map((b: string) => ({ value: b }));
    }
  },
);

function handleOk() {
  workflowStore.updateSteps(editingSteps.value);
  emit("close");
}

function handleCancel() {
  emit("close");
}

function addStep() {
  const stepId = "step-" + Date.now();
  const step: TaskStep = {
    id: stepId,
    type: "git-checkout",
    params: {},
  };
  editingSteps.value.push(step);
}

function removeStep(index: number) {
  editingSteps.value.splice(index, 1);
}
</script>

<template>
  <Modal
    :open="isOpen"
    title="Configure Workflow"
    @ok="handleOk"
    @cancel="handleCancel"
    width="680px"
  >
    <div class="editor-body">
      <List :data-source="editingSteps" :split="false" class="custom-step-list">
        <template #renderItem="{ item, index }">
          <ListItem class="step-card">
            <div class="step-row">
              <MenuOutlined class="drag-handle" />

              <Select
                v-model:value="item.type"
                :options="stepTypes"
                style="width: 140px; flex-shrink: 0"
                size="small"
              />

              <div class="step-params">
                <AutoComplete
                  v-if="item.type === 'git-checkout'"
                  v-model:value="item.params.branch"
                  :options="historyBranches"
                  placeholder="Branch name (e.g. main)"
                  size="small"
                  style="width: 100%"
                />

                <Space
                  v-else-if="item.type === 'git-merge'"
                  style="width: 100%"
                  size="small"
                >
                  <AutoComplete
                    v-model:value="item.params.targetBranch"
                    :options="historyBranches"
                    placeholder="Target (master)"
                    size="small"
                    style="width: 160px"
                  />
                  <span>←</span>
                  <AutoComplete
                    v-model:value="item.params.sourceBranch"
                    :options="historyBranches"
                    placeholder="Source (feature)"
                    size="small"
                    style="width: 160px"
                  />
                </Space>

                <Input
                  v-else-if="item.type === 'custom-command'"
                  v-model:value="item.params.cmd"
                  placeholder="Enter shell command"
                  size="small"
                />
                <div v-else class="step-cmd">No parameters required</div>
              </div>

              <Button
                type="text"
                danger
                style="margin-left: auto"
                @click="removeStep(index)"
              >
                <template #icon><DeleteOutlined /></template>
              </Button>
            </div>
          </ListItem>
        </template>
      </List>

      <div class="add-step-row">
        <Space class="add-step-inputs" />
        <Button @click="addStep" type="primary">
          <template #icon><PlusOutlined /></template>
          Add Step
        </Button>
      </div>
    </div>
  </Modal>
</template>

<style scoped>
.editor-body {
  display: flex;
  flex-direction: column;
  background: #fdfdfd;
  padding: 12px;
  border-radius: 8px;
  border: 1px dashed rgba(0, 0, 0, 0.08);
}
.steps-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 480px;
  overflow-y: auto;
  padding-right: 6px;
}
.step-row {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}
.drag-handle {
  cursor: grab;
  color: #bfbfbf;
  font-size: 14px;
}
.step-info {
  display: flex;
  flex: 1;
  gap: 12px;
  align-items: center;
}
.step-params {
  flex: 1;
  display: flex;
  align-items: center;
}
.step-cmd {
  font-size: 13px;
  color: #bfbfbf;
  font-family: monospace;
}
.merge-arrow {
  color: #bfbfbf;
  padding: 0 4px;
}
.add-step-row {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 16px;
}
.step-card {
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 8px;
  padding: 12px 14px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
  transition: all 0.2s;
}
.step-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  border-color: rgba(22, 119, 255, 0.2);
}
</style>
