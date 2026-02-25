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
      <Tag class="branch-tag" :bordered="false" color="processing">
        <Icon name="git-branch" :size="12" />
        {{ repo.currentBranch || "loading..." }}
      </Tag>
    </div>
  </ListItem>
</template>

<style scoped>
.repo-item {
  cursor: pointer;
  transition: background-color 0.2s;
  padding: 8px 12px;
}
.repo-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}
.repo-item-selected {
  background-color: rgba(22, 119, 255, 0.06);
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
.branch-tag {
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
</style>
