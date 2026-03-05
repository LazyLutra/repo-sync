<script setup lang="ts">
import { useLogStore } from "../../store/useLogStore";
import { ref, watch, nextTick, computed } from "vue";
import { Card, Button, Typography, Tag } from "ant-design-vue";
import { DeleteOutlined } from "@ant-design/icons-vue";

const { Text } = Typography;
const logStore = useLogStore();
const logContentRef = ref<HTMLElement | null>(null);

watch(
  () => logStore.logs,
  () => {
    nextTick(() => {
      if (logContentRef.value) {
        logContentRef.value.scrollTop = logContentRef.value.scrollHeight;
      }
    });
  },
  { deep: true },
);

function getStatusColor(status: string) {
  switch (status) {
    case "error":
      return "error";
    case "success":
      return "success";
    case "running":
      return "processing";
    default:
      return "default";
  }
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

const groupedLogs = computed(() => {
  const groups: Record<string, typeof logStore.logs> = {};
  for (const log of logStore.logs) {
    if (!groups[log.repoPath]) {
      groups[log.repoPath] = [];
    }
    groups[log.repoPath].push(log);
  }
  return groups;
});
</script>

<template>
  <Card
    title="Execution Logs"
    size="small"
    class="log-card"
    :body-style="{
      flex: 1,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }"
  >
    <template #extra>
      <Button type="text" danger size="small" @click="logStore.clearLogs">
        <template #icon><DeleteOutlined /></template>
        Clear
      </Button>
    </template>

    <div ref="logContentRef" class="log-content">
      <div v-if="logStore.logs.length === 0" class="log-empty">
        Ready to execute. Select repositories and configure workflow.
      </div>

      <div
        v-for="(repoLogs, repoPath) in groupedLogs"
        :key="repoPath"
        class="repo-group"
      >
        <div class="repo-header">
          <Tag color="geekblue" class="repo-tag">{{
            String(repoPath).split(/[\\/]/).pop()
          }}</Tag>
          <Text type="secondary" style="font-size: 11px">{{ repoPath }}</Text>
        </div>

        <div class="repo-steps">
          <div
            v-for="log in repoLogs"
            :key="log.stepId"
            class="log-step"
            :class="`status-${log.status}`"
          >
            <div class="step-meta">
              <span class="step-command"
                >$ {{ log.commandStr || log.output }}</span
              >
              <Tag
                :color="getStatusColor(log.status)"
                style="margin-left: auto"
              >
                {{ log.status.toUpperCase() }}
              </Tag>
              <Text type="secondary" class="log-time">{{
                formatTime(log.timestamp)
              }}</Text>
            </div>

            <pre
              v-if="log.output && log.status !== 'running'"
              class="step-output"
              :class="{ 'is-error': log.status === 'error' }"
              >{{ log.output }}</pre
            >
          </div>
        </div>
      </div>
    </div>
  </Card>
</template>

<style scoped>
.log-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.log-content {
  flex: 1;
  overflow-y: auto;
  font-family: "JetBrains Mono", "Menlo", "Monaco", "Courier New", monospace;
  font-size: 12px;
  padding: 16px;
  border-radius: 8px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
}
.log-empty {
  color: var(--text-secondary);
}
.repo-group {
  margin-bottom: 16px;
  background: var(--bg-primary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
  overflow: hidden;
}
.repo-header {
  padding: 8px 12px;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 8px;
}
.repo-tag {
  font-weight: 600;
  font-size: 12px;
  padding: 0 8px;
  border-radius: 4px;
}
.repo-steps {
  padding: 8px 0;
  display: flex;
  flex-direction: column;
}
.log-step {
  padding: 6px 12px 6px 24px;
  position: relative;
}
.log-step::before {
  content: "";
  position: absolute;
  left: 12px;
  top: 14px;
  bottom: -14px;
  width: 2px;
  background: var(--border-color);
}
.log-step:last-child::before {
  display: none;
}
.log-step:not(:last-child) {
  margin-bottom: 8px;
}
.step-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}
.step-command {
  font-weight: 600;
  color: var(--text-primary);
  background: var(--bg-tertiary);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}
.log-time {
  font-size: 11px;
}
.step-output {
  margin: 6px 0 0 0;
  padding: 8px 12px;
  white-space: pre-wrap;
  word-break: break-all;
  color: var(--text-primary);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 12px;
}
.step-output.is-error {
  color: var(--log-error);
  background: rgba(255, 69, 58, 0.1);
  border-color: rgba(255, 69, 58, 0.2);
}

/* Status dots */
.log-step::after {
  content: "";
  position: absolute;
  left: 9px;
  top: 14px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--border-color);
}
.status-running::after {
  background: var(--log-info);
  box-shadow: 0 0 0 2px rgba(100, 210, 255, 0.2);
}
.status-success::after {
  background: var(--log-success);
}
.status-error::after {
  background: var(--log-error);
}
</style>
