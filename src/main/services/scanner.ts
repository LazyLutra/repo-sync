import * as fs from 'fs/promises'
import * as path from 'path'
import simpleGit from 'simple-git'
import { RepoInfo } from '../../../shared/types'
import { DEFAULT_IGNORE_DIRS } from '../../../shared/constants'

export async function scanRepos(rootPath: string): Promise<RepoInfo[]> {
  try {
    const entries = await fs.readdir(rootPath, { withFileTypes: true })
    const repos: RepoInfo[] = []
    for (const entry of entries) {
      if (!entry.isDirectory() || DEFAULT_IGNORE_DIRS.includes(entry.name)) continue
      
      const fullPath = path.join(rootPath, entry.name)
      const gitPath = path.join(fullPath, '.git')
      
      try {
        await fs.access(gitPath)
        repos.push({
          name: entry.name,
          path: fullPath,
          currentBranch: '', // 初始不拉取
          isDirty: false
        })
      } catch { /* 不是Git目录 */ }
    }
    return repos
  } catch (error) {
    console.error('Scan failed:', error)
    throw error
  }
}

export async function refreshGitStatus(repoPath: string): Promise<Partial<RepoInfo>> {
  const git = simpleGit(repoPath)
  const status = await git.status()
  const log = await git.log({ maxCount: 1 }).catch(() => null)
  const remotes = await git.getRemotes(true).catch(() => [])

  return {
    currentBranch: status.current ?? '',
    isDirty: !status.isClean(),
    remoteUrl: remotes[0]?.refs?.fetch ?? '',
    lastCommitMessage: log?.latest?.message,
    lastCommitTime: log?.latest?.date
  }
}
