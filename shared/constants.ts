/**
 * 跨进程共享常量
 */

/** 默认忽略的目录 */
export const DEFAULT_IGNORE_DIRS = [
  'node_modules',
  '.git',
  'dist',
  'dist-electron',
  'build',
  'out',
  '.idea',
  '.vscode',
  '__pycache__',
  'target',
  'bin',
  'obj',
]

/** 默认最大扫描深度 */
export const MAX_SCAN_DEPTH = 5

/** 默认并发数 */
export const DEFAULT_CONCURRENCY = 3
