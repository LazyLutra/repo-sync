/**
 * 跨进程共享类型定义
 * 主进程和渲染进程均可导入使用
 */

/** 仓库信息 */
export interface RepoInfo {
  /** 仓库名称 */
  name: string
  /** 仓库绝对路径 */
  path: string
  /** 当前分支 */
  currentBranch: string
  /** 是否有未提交的变更 */
  isDirty: boolean
  /** 远程仓库地址 */
  remoteUrl?: string
  /** 最后一次提交信息 */
  lastCommitMessage?: string
  /** 最后一次提交时间 */
  lastCommitTime?: string
}

/** 任务步骤 */
export interface TaskStep {
  /** 步骤 ID */
  id: string
  /** 步骤类型 */
  type: 'git-pull' | 'git-push' | 'git-checkout' | 'custom-command' | 'git-fetch' | 'git-merge'
  /** 步骤参数 */
  params: Record<string, unknown>
  /** 步骤描述 */
  description?: string
}

/** 工作流定义 */
export interface Workflow {
  /** 工作流 ID */
  id: string
  /** 工作流名称 */
  name: string
  /** 步骤列表 */
  steps: TaskStep[]
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt: string
}

/** 批量执行结果 */
export interface BatchResult {
  /** 仓库路径 */
  repoPath: string
  /** 是否成功 */
  success: boolean
  /** 输出信息 */
  output: string
  /** 错误信息 */
  error?: string
}

/** 持久化保存的环境服务 */
export interface SavedEnvService {
  /** 服务 ID */
  id: string
  /** 服务类型 */
  type: 'nacos' | 'redis' | 'nginx' | 'unknown'
  /** 显示名称 */
  name: string
  /** 端口 */
  port: number
  /** 服务所在目录 */
  dirPath: string
  /** 启动命令 */
  startCommand: string
  /** 配置文件相对路径 */
  configFilePath: string
}

/** 应用配置 */
export interface AppConfig {
  /** 上次选择并成功扫描的父文件夹路径 */
  lastRootPath?: string
  /** 批量执行并发数（默认 3） */
  concurrency: number
  /** 忽略扫描的目录（来自常量） */
  ignoreDirs: string[]
  /** 已添加的环境服务列表 */
  envServices?: SavedEnvService[]
}
