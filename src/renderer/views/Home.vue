<script setup lang="ts">
import { useAppStore } from "../store/useAppStore";
import WorkflowSection from "../components/business/WorkflowSection.vue";
import LogPanel from "../components/business/LogPanel.vue";
import EnvironmentView from "../components/business/EnvironmentView.vue";

const appStore = useAppStore();
</script>

<template>
  <div class="home-view">
    <template v-if="appStore.activeGlobalView === 'git'">
      <WorkflowSection />
      <LogPanel />
    </template>

    <template v-else-if="appStore.activeGlobalView === 'env'">
      <EnvironmentView />
    </template>
  </div>
</template>

<style scoped>
.home-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 24px;
  gap: 24px;
  overflow: auto;
  background-color: var(--bg-primary);
}
</style>
