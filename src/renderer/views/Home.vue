<script setup lang="ts">
import WorkflowSection from "../components/business/WorkflowSection.vue";
import LogPanel from "../components/business/LogPanel.vue";
</script>

<template>
  <div class="home-view">
    <WorkflowSection />
    <LogPanel />
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
}
</style>
