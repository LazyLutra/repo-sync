import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const theme = ref<'dark' | 'light'>('light')
  const sidebarWidth = ref(420)

  function toggleTheme(newTheme: 'dark' | 'light') {
    theme.value = newTheme
  }

  function setSidebarWidth(width: number) {
    sidebarWidth.value = width
  }

  return {
    theme,
    sidebarWidth,
    toggleTheme,
    setSidebarWidth
  }
})
