import { defineStore } from "pinia";
import { ref } from "vue";

export const useAppStore = defineStore("app", () => {
  const theme = ref<"dark" | "light">("light");
  const sidebarWidth = ref(420);

  const activeGlobalView = ref<"git" | "env">("git");

  function toggleTheme(newTheme: "dark" | "light") {
    theme.value = newTheme;
  }

  function setSidebarWidth(width: number) {
    sidebarWidth.value = width;
  }

  function setActiveGlobalView(view: "git" | "env") {
    activeGlobalView.value = view;
  }

  return {
    theme,
    sidebarWidth,
    activeGlobalView,
    toggleTheme,
    setSidebarWidth,
    setActiveGlobalView,
  };
});
