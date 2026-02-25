<script setup lang="ts">
import { computed } from "vue";
import { useAppStore } from "./store/useAppStore";
import { ConfigProvider, theme } from "ant-design-vue";
import MainLayout from "./components/layout/MainLayout.vue";
import zhCN from "ant-design-vue/es/locale/zh_CN";

const appStore = useAppStore();

const currentTheme = computed(() => ({
  algorithm:
    appStore.theme === "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm,
  token: {
    colorPrimary: "#1677ff",
    borderRadius: 8,
  },
}));
</script>

<template>
  <ConfigProvider :theme="currentTheme" :locale="zhCN">
    <MainLayout>
      <router-view></router-view>
    </MainLayout>
  </ConfigProvider>
</template>
