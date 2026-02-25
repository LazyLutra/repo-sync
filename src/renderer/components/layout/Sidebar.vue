<script setup lang="ts">
import { useAppStore } from "../../store/useAppStore";
import { useRepoStore } from "../../store/useRepoStore";
import RepoList from "../business/RepoList.vue";
import Icon from "../common/Icon.vue";
import { Button, Space, Typography } from "ant-design-vue";

const { Title } = Typography;
const appStore = useAppStore();
const repoStore = useRepoStore();

function toggleTheme(theme: "dark" | "light") {
  appStore.toggleTheme(theme);
}

async function handleSelectFolder() {
  try {
    const path = await window.electronAPI.selectDirectory();
    if (path) {
      repoStore.setRootPath(path);
      await repoStore.scanDirectory();
    }
  } catch (error) {
    console.error("Failed to select directory:", error);
  }
}
</script>

<template>
  <div class="sidebar-container">
    <!-- Header -->
    <div class="sidebar-header">
      <Title :level="4" style="margin: 0">RepoSync</Title>

      <!-- Theme Toggle -->
      <Space size="small" class="theme-toggle-group">
        <Button
          type="text"
          size="small"
          :class="{ 'theme-btn-active': appStore.theme === 'dark' }"
          @click="toggleTheme('dark')"
        >
          <Icon name="moon" :size="14" />
        </Button>
        <Button
          type="text"
          size="small"
          :class="{ 'theme-btn-active': appStore.theme === 'light' }"
          @click="toggleTheme('light')"
        >
          <Icon name="sun" :size="14" />
        </Button>
      </Space>
    </div>

    <!-- Actions -->
    <div class="actions-container">
      <Button
        type="primary"
        block
        class="action-btn"
        @click="handleSelectFolder"
      >
        <template #icon><Icon name="folder-search" :size="14" /></template>
        Select Folder
      </Button>

      <div v-if="repoStore.rootPath" class="current-path">
        <Typography.Text
          type="secondary"
          :ellipsis="{ tooltip: repoStore.rootPath }"
          :content="repoStore.rootPath"
        />
      </div>
    </div>

    <!-- Repo List -->
    <div class="repo-list-container">
      <RepoList />
    </div>
  </div>
</template>

<style scoped>
.sidebar-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;
  gap: 16px;
}
.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.theme-toggle-group {
  padding: 2px;
  border-radius: 6px;
}
.theme-btn-active {
  background: rgba(0, 0, 0, 0.06);
  border-radius: 4px;
}
.actions-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.current-path {
  font-size: 12px;
  padding: 0 4px;
}
.repo-list-container {
  flex: 1;
  overflow-y: auto;
}
.selection-actions {
  display: flex;
  justify-content: space-between;
  padding: 0 4px;
}
</style>
