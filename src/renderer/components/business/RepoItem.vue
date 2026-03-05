<script setup lang="ts">
import { useRepoStore, type Repo } from "../../store/useRepoStore";
import { ListItem, Checkbox, Tag, Typography } from "ant-design-vue";
import Icon from "../common/Icon.vue";

const props = defineProps<{
  repo: Repo;
}>();

const repoStore = useRepoStore();

function toggleSelection() {
  repoStore.toggleSelection(props.repo.path);
}
</script>

<template>
  <ListItem class="repo-item" :class="{ 'repo-item-selected': repo.selected }">
    <div class="repo-item-inner" @click="toggleSelection">
      <Checkbox :checked="repo.selected" @click.stop="toggleSelection" />

      <div class="repo-info">
        <Typography.Text class="repo-name" strong>{{
          repo.name
        }}</Typography.Text>
        <Typography.Text type="secondary" class="repo-path">
          <Icon name="folder" :size="10" /> {{ repo.path }}
        </Typography.Text>
      </div>

      <!-- Git Branch Placeholder -->
      <div class="branch-badge">
        <Icon name="git-branch" :size="12" />
        {{ repo.currentBranch || "loading..." }}
      </div>
    </div>
  </ListItem>
</template>

<style scoped>
.repo-item {
  cursor: pointer;
  transition: background-color 0.2s;
  padding: 12px;
  border-radius: 10px;
  background-color: var(--bg-primary);
  border: 1px solid transparent;
}
.repo-item:hover {
  background-color: var(--bg-hover);
}
.repo-item-selected {
  border-color: var(--accent-color);
}
.repo-item-inner {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}
.repo-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  gap: 2px;
}
.repo-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 14px;
}
.repo-path {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.branch-badge {
  background-color: var(--bg-tertiary);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  color: var(--text-secondary);
  width: fit-content;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  position: relative;
  flex-shrink: 0;
}
.branch-badge:hover {
  background-color: var(--bg-primary);
  color: var(--text-primary);
}
</style>
