<script setup lang="ts">
import { GitBranch, Server, Settings } from "lucide-vue-next";
import { useAppStore } from "../../store/useAppStore";

const appStore = useAppStore();

function switchGlobalView(view: "git" | "env") {
  appStore.setActiveGlobalView(view);
}
</script>

<template>
  <div class="activity-bar">
    <div
      class="activity-icon"
      :class="{ active: appStore.activeGlobalView === 'git' }"
      @click="switchGlobalView('git')"
      title="Git Batch Management"
    >
      <GitBranch :size="20" />
    </div>

    <div
      class="activity-icon"
      :class="{ active: appStore.activeGlobalView === 'env' }"
      @click="switchGlobalView('env')"
      title="Environment Services"
    >
      <Server :size="20" />
    </div>

    <div class="spacer"></div>

    <div class="activity-icon" title="Settings">
      <Settings :size="20" />
    </div>
  </div>
</template>

<style scoped>
.activity-bar {
  width: 50px;
  background-color: var(--bg-tertiary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 16px;
  padding-bottom: 16px;
  flex-shrink: 0;
  z-index: 10;
  gap: 16px;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s;
  border-left: 2px solid transparent;
}

.activity-icon:hover {
  color: var(--text-primary);
  background-color: var(--bg-secondary);
}

.activity-icon.active {
  color: var(--accent-color);
  border-left-color: var(--accent-color);
  background-color: var(--bg-primary);
}

.spacer {
  flex: 1;
}
</style>
