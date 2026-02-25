<script setup lang="ts">
import { computed } from "vue";
import * as LucideIcons from "lucide-vue-next";

const props = defineProps<{
  name: string;
  size?: number | string;
  color?: string;
}>();

const iconComponent = computed(() => {
  // Convert kebab-case to PascalCase (e.g. 'git-branch' -> 'GitBranch')
  const pascalName = props.name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

  // @ts-ignore
  return LucideIcons[pascalName] || LucideIcons.File;
});
</script>

<template>
  <component
    :is="iconComponent"
    :size="size || 16"
    :color="color || 'currentColor'"
  />
</template>
