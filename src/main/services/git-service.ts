/**
 * Git 操作服务
 * 封装常用 Git 命令（pull, push, checkout 等）
 */

// TODO: 实现 Git 操作
export async function gitPull(_repoPath: string, _remote?: string, _branch?: string) {
  // 占位实现
}

export async function gitPush(_repoPath: string, _remote?: string, _branch?: string) {
  // 占位实现
}

export async function gitCheckout(_repoPath: string, _branch: string) {
  // 占位实现
}

export async function gitStatus(_repoPath: string) {
  // 占位实现
  return { isDirty: false, currentBranch: 'main' }
}
