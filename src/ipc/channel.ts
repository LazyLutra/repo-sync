/**
 * IPC 通道名称常量定义
 * 主进程和渲染进程共享，防止通道名拼写错误
 */
export const IPC_CHANNELS = {
  // 目录选择
  SELECT_DIRECTORY: 'select-directory',

  // 仓库扫描
  SCAN_REPOS: 'scan-repos',
  SCAN_REPOS_PROGRESS: 'scan-repos-progress',
  SCAN_REPOS_RESULT: 'scan-repos-result',

  // 批量操作
  START_BATCH: 'start-batch',
  BATCH_PROGRESS: 'batch-progress',
  BATCH_RESULT: 'batch-result',

  // 应用配置
  GET_CONFIG: 'get-config',
  SET_CONFIG: 'set-config',
  
  // Git操作相关
  REFRESH_GIT_STATUS: 'refresh-git-status',

  // Environment Services
  ANALYZE_ENV_DIR: 'analyze-env-dir',
  READ_ENV_CONFIG: 'read-env-config',
  WRITE_ENV_CONFIG: 'write-env-config',
  START_ENV_SERVICE: 'start-env-service',
  STOP_ENV_SERVICE: 'stop-env-service',
  IS_ENV_SERVICE_RUNNING: 'is-env-service-running',
  ENV_SERVICE_LOG: 'env-service-log',
  ENV_SERVICE_EXIT: 'env-service-exit',
  GET_ENV_SERVICES: 'get-env-services',
  SAVE_ENV_SERVICES: 'save-env-services',

  // 窗口控制
  WINDOW_MINIMIZE: 'window-minimize',
  WINDOW_MAXIMIZE: 'window-maximize',
  WINDOW_CLOSE: 'window-close',
} as const

export type IpcChannel = typeof IPC_CHANNELS[keyof typeof IPC_CHANNELS]
