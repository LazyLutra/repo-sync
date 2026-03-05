import fs from 'node:fs/promises'
import path from 'node:path'

export interface EnvServiceDetails {
  type: 'nacos' | 'redis' | 'nginx' | 'unknown'
  port: number
  startCommand: string
  configFilePath: string
}

export async function analyzeEnvironmentDir(dirPath: string): Promise<EnvServiceDetails> {
  try {
    const files = await fs.readdir(dirPath)
    
    // Check for Nacos: has bin and conf folders, contains startup.sh or startup.cmd
    if (files.includes('bin') && files.includes('conf')) {
      const binFiles = await fs.readdir(path.join(dirPath, 'bin'))
      if (binFiles.some(f => f.includes('startup'))) {
        return {
          type: 'nacos',
          port: 8848,
          startCommand: 'bin\\startup.cmd -m standalone',
          configFilePath: 'conf/application.properties',
        }
      }
    }

    // Check for Redis: contains redis-server.exe or redis.conf
    if (files.includes('redis-server.exe') || files.includes('redis.conf')) {
      return {
        type: 'redis',
        port: 6379,
        startCommand: 'redis-server.exe redis.conf',
        configFilePath: 'redis.conf',
      }
    }

    // Check for Nginx: contains nginx.exe and conf/nginx.conf
    if (
      files.includes('nginx.exe') ||
      files.includes('nginx.conf') ||
      (files.includes('conf') && (await fs.readdir(path.join(dirPath, 'conf'))).includes('nginx.conf'))
    ) {
      return {
        type: 'nginx',
        port: 80,
        startCommand: 'nginx.exe',
        configFilePath: 'conf/nginx.conf',
      }
    }

  } catch (error) {
    console.error('Failed to analyze environment directory:', error)
  }
  
  return { type: 'unknown', port: 0, startCommand: '', configFilePath: '' }
}

export async function readEnvConfig(filePath: string): Promise<string> {
  try {
    return await fs.readFile(filePath, 'utf-8')
  } catch (error) {
    console.error('Failed to read env config:', error)
    return ''
  }
}

export async function writeEnvConfig(filePath: string, content: string): Promise<boolean> {
  try {
    await fs.writeFile(filePath, content, 'utf-8')
    return true
  } catch (error) {
    console.error('Failed to write env config:', error)
    return false
  }
}
