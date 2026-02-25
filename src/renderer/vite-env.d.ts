/// <reference types="vite/client" />

interface Window {
  electronAPI: {
    selectDirectory: () => Promise<string | null>;
    scanRepos: (path: string) => Promise<import('../../shared/types').RepoInfo[]>;
    getConfig: () => Promise<import('../../shared/types').AppConfig>;
    refreshGitStatus: (path: string) => Promise<Partial<import('../../shared/types').RepoInfo>[]>;
    startBatch: (repoPaths: string[], workflow: import('../../shared/types').Workflow) => Promise<import('../../shared/types').BatchResult[]>;
    onBatchProgress: (callback: (payload: { repoPath: string, stepId: string, status: 'running'|'success'|'error', output: string, timestamp: number }) => void) => void;
  };
}
