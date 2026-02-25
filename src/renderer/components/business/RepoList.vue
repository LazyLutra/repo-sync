<script setup lang="ts">
import { computed } from "vue";
import { useRepoStore } from "../../store/useRepoStore";
import { Table, Tag, Typography } from "ant-design-vue";
import Icon from "../common/Icon.vue";

const repoStore = useRepoStore();

const columns = [
  {
    title: "Repository",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Git Branch",
    dataIndex: "currentBranch",
    key: "currentBranch",
    align: "right" as const,
  },
];

const selectedRowKeys = computed({
  get: () => repoStore.repos.filter((r) => r.selected).map((r) => r.path),
  set: (keys: (string | number)[]) => {
    repoStore.repos.forEach((r) => {
      r.selected = keys.includes(r.path);
    });
  },
});

const onSelectChange = (keys: (string | number)[]) => {
  selectedRowKeys.value = keys;
};

const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: onSelectChange,
}));
</script>

<template>
  <div class="repo-list-wrapper">
    <Table
      class="borderless-table"
      :data-source="repoStore.repos"
      :columns="columns"
      :row-key="(record) => record.path"
      :pagination="false"
      size="small"
      :loading="repoStore.isScanning"
      :row-selection="rowSelection"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'name'">
          <div class="repo-info">
            <Typography.Text class="repo-name" strong>{{
              record.name
            }}</Typography.Text>
            <Typography.Text type="secondary" class="repo-path">
              <Icon name="folder" :size="10" /> {{ record.path }}
            </Typography.Text>
          </div>
        </template>
        <template v-else-if="column.key === 'currentBranch'">
          <Tag :bordered="false" color="processing" class="branch-tag">
            <Icon name="git-branch" :size="12" />
            {{ record.currentBranch || "..." }}
          </Tag>
        </template>
      </template>
    </Table>
  </div>
</template>

<style scoped>
.repo-list-wrapper {
  padding: 4px 0;
}
.repo-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  gap: 2px;
}
.repo-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 13px;
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

/* Remove table border styles to make it look clean */
:deep(.ant-table-wrapper),
:deep(.ant-table) {
  background: transparent !important;
}
:deep(.ant-table-thead > tr > th) {
  background: transparent !important;
  border-bottom: 1px dashed rgba(0, 0, 0, 0.08) !important;
}
:deep(.ant-table-tbody > tr > td) {
  border-bottom: 1px solid rgba(0, 0, 0, 0.04) !important;
  padding: 8px 4px !important;
}
:deep(.ant-table-tbody > tr.ant-table-row-selected > td) {
  background: rgba(22, 119, 255, 0.04) !important;
}
:deep(.ant-table-tbody > tr:hover > td) {
  background: rgba(0, 0, 0, 0.02) !important;
}
</style>
