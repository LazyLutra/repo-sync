<script setup lang="ts">
import { computed } from "vue";
import { useAppStore } from "./store/useAppStore";
import { ConfigProvider, theme } from "ant-design-vue";
import MainLayout from "./components/layout/MainLayout.vue";
import zhCN from "ant-design-vue/es/locale/zh_CN";
import { watchEffect } from "vue";

const appStore = useAppStore();

const currentTheme = computed(() => {
  const isDark = appStore.theme === "dark";
  return {
    algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorPrimary: "#ff3b30",
      colorBgBase: isDark ? "#1c1c1e" : "#f5f5f7",
      colorBgContainer: isDark ? "#2c2c2e" : "#ffffff",
      colorBgElevated: isDark ? "#3a3a3c" : "#ffffff",
      colorBorder: isDark ? "#38383a" : "#d1d1d6",
      colorTextBase: isDark ? "#ffffff" : "#1c1c1e",
      borderRadius: 10,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    },
    components: {
      Card: {
        colorBgContainer: isDark ? "#2c2c2e" : "#ffffff",
        colorBorderSecondary: isDark ? "#38383a" : "#d1d1d6",
      },
      Button: {
        borderRadius: 10,
      },
    },
  };
});

watchEffect(() => {
  document.documentElement.setAttribute("data-theme", appStore.theme);
});
</script>

<template>
  <ConfigProvider :theme="currentTheme" :locale="zhCN">
    <MainLayout>
      <router-view></router-view>
    </MainLayout>
  </ConfigProvider>
</template>
