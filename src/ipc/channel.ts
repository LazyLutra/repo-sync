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

  // 窗口控制
  WINDOW_MINIMIZE: 'window-minimize',
  WINDOW_MAXIMIZE: 'window-maximize',
  WINDOW_CLOSE: 'window-close',
} as const

export type IpcChannel = typeof IPC_CHANNELS[keyof typeof IPC_CHANNELS]
