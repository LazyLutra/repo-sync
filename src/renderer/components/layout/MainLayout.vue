<script setup lang="ts">
import { computed, ref } from "vue";
import { Layout, LayoutContent, LayoutSider } from "ant-design-vue";
import ActivityBar from "./ActivityBar.vue";
import Sidebar from "./Sidebar.vue";
import { useAppStore } from "../../store/useAppStore";

const appStore = useAppStore();
const isResizing = ref(false);

const isSidebarCollapsed = computed(() => {
  return appStore.activeGlobalView !== "git";
});

function startResize(e: MouseEvent) {
  e.preventDefault();
  isResizing.value = true;
  document.addEventListener("mousemove", handleResize);
  document.addEventListener("mouseup", stopResize);
}

function handleResize(e: MouseEvent) {
  if (isResizing.value) {
    const newWidth = Math.max(200, Math.min(e.clientX, 800));
    appStore.setSidebarWidth(newWidth);
  }
}

function stopResize() {
  isResizing.value = false;
  document.removeEventListener("mousemove", handleResize);
  document.removeEventListener("mouseup", stopResize);
}
</script>

<template>
  <Layout class="main-layout" has-sider>
    <!-- Global Navigation Activity Bar -->
    <ActivityBar />

    <LayoutSider
      v-model:collapsed="isSidebarCollapsed"
      :collapsedWidth="0"
      :width="appStore.sidebarWidth"
      :theme="appStore.theme"
      collapsible
      :trigger="null"
      class="layout-sider"
    >
      <Sidebar />
      <!-- Only show resizer if sidebar is not collapsed -->
      <div
        v-if="!isSidebarCollapsed"
        class="sider-resizer"
        :class="{ resizing: isResizing }"
        @mousedown="startResize"
      ></div>
    </LayoutSider>

    <LayoutContent class="layout-content">
      <slot></slot>
    </LayoutContent>
  </Layout>
</template>

<style scoped>
.main-layout {
  height: 100vh;
  background-color: var(--bg-primary);
}
.layout-sider {
  border-right: 1px solid var(--border-color);
  position: relative;
  background-color: var(--bg-secondary) !important;
}
.sider-resizer {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 5px;
  cursor: col-resize;
  z-index: 100;
  transition: background-color 0.2s;
}
.sider-resizer:hover,
.sider-resizer.resizing {
  background-color: var(--accent-color);
}
.layout-content {
  overflow: hidden;
  background-color: var(--bg-primary);
  display: flex;
  flex-direction: column;
}
</style>
