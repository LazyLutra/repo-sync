<script setup lang="ts">
import { ref } from "vue";
import { Layout, LayoutContent, LayoutSider } from "ant-design-vue";
import Sidebar from "./Sidebar.vue";
import { useAppStore } from "../../store/useAppStore";

const appStore = useAppStore();
const collapsed = ref(false);
const isResizing = ref(false);

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
  <Layout class="main-layout">
    <LayoutSider
      v-model:collapsed="collapsed"
      :width="appStore.sidebarWidth"
      :theme="appStore.theme"
      collapsible
      :trigger="null"
      class="layout-sider"
    >
      <Sidebar />
      <div
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
}
.layout-sider {
  border-right: 1px solid rgba(0, 0, 0, 0.06);
  position: relative;
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
  background-color: #1677ff;
}
.layout-content {
  overflow: hidden;
}
</style>
