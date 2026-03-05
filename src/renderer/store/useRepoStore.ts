import { defineStore } from "pinia";
import { ref } from "vue";
import type { RepoInfo } from "../../../shared/types";

export interface Repo extends RepoInfo {
  selected: boolean;
}

export const useRepoStore = defineStore("repo", () => {
  const repos = ref<Repo[]>([]);
  const rootPath = ref<string>("");
  const isScanning = ref<boolean>(false);

  function toggleSelection(path: string) {
    const repo = repos.value.find((r) => r.path === path);
    if (repo) {
      repo.selected = !repo.selected;
    }
  }

  function selectAll() {
    repos.value.forEach((r) => (r.selected = true));
  }

  function deselectAll() {
    repos.value.forEach((r) => (r.selected = false));
  }

  function setRootPath(path: string) {
    rootPath.value = path;
  }

  async function refreshGitStatus(repo: Repo) {
    try {
      const status = await window.electronAPI.refreshGitStatus(repo.path);
      Object.assign(repo, status);
    } catch (e) {
      console.error(`Failed to refresh status for ${repo.path}`, e);
    }
  }

  async function scanDirectory() {
    if (!rootPath.value) return;
    isScanning.value = true;
    try {
      const scannedRepos = await window.electronAPI.scanRepos(rootPath.value);
      repos.value = scannedRepos.map((repo) => ({
        ...repo,
        selected: true, // 扫描到的包默认全部选中状态
      }));

      // 并发异步去刷新每个库的分支等 git 状态，不必阻塞整个列表首屏渲染
      Promise.allSettled(repos.value.map(refreshGitStatus));
    } catch (error) {
      console.error("Scan failed:", error);
    } finally {
      isScanning.value = false;
    }
  }

  /** 应用启动时调用，从持久化存储恢复上次的 rootPath 并自动扫描 */
  async function init() {
    try {
      const config = await window.electronAPI.getConfig();
      if (config?.lastRootPath) {
        rootPath.value = config.lastRootPath;
        await scanDirectory();
      }
    } catch (error) {
      console.error("Failed to restore last root path:", error);
    }
  }

  return {
    repos,
    rootPath,
    isScanning,
    toggleSelection,
    selectAll,
    deselectAll,
    setRootPath,
    scanDirectory,
    refreshGitStatus,
    init,
  };
});
