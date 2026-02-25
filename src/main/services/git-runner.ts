import simpleGit from 'simple-git'
import { exec } from 'child_process'
import { promisify } from 'util'
import { TaskStep } from '../../../shared/types'

const execAsync = promisify(exec)

export function formatGitCommand(step: TaskStep): string {
  switch (step.type) {
    case 'git-pull': return 'git pull'
    case 'git-push': return 'git push'
    case 'git-checkout': return `git checkout ${step.params.branch || ''}`
    case 'git-merge': return `git checkout ${step.params.targetBranch || ''} && git merge ${step.params.sourceBranch || ''}`
    case 'git-fetch': return 'git fetch'
    case 'custom-command': return String(step.params.cmd || '')
    default: return step.type
  }
}

export async function runStep(repoPath: string, step: TaskStep): Promise<string> {
  const git = simpleGit(repoPath)
  let output = ''

  try {
    switch (step.type) {
      case 'git-pull': {
        const result = await git.pull()
        output = `Pull result: ${result.files.length} files updated. ${result.summary.changes} changes.`
        break
      }
      case 'git-push': {
        const result = await git.push()
        output = `Push completed. ${result.pushed.map(p => p.branch).join(', ')}`
        break
      }
      case 'git-checkout': {
        const branch = step.params.branch as string
        if (!branch) throw new Error('Branch parameter is required for git-checkout')
        await git.checkout(branch)
        output = `Switched to branch '${branch}'`
        break
      }
      case 'git-merge': {
        const targetBranch = step.params.targetBranch as string
        const sourceBranch = step.params.sourceBranch as string
        if (!targetBranch || !sourceBranch) throw new Error('Both targetBranch and sourceBranch are required for git-merge')
        
        await git.checkout(targetBranch)
        await git.merge([sourceBranch])
        output = `Merged '${sourceBranch}' into '${targetBranch}'`
        break
      }
      case 'git-fetch': {
        await git.fetch()
        output = `Fetch completed.`
        break
      }
      case 'custom-command': {
        const cmd = step.params.cmd as string
        if (!cmd) throw new Error('Command parameter is required for custom-command')
        const { stdout, stderr } = await execAsync(cmd, { cwd: repoPath })
        output = stdout + (stderr ? `\nErrors: ${stderr}` : '')
        break
      }
      default:
        throw new Error(`Unsupported step type: ${step.type}`)
    }
  } catch (error: any) {
    throw new Error(`[${step.type}] failed: ${error.message || error}`)
  }

  return output
}
