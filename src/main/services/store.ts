import Store from 'electron-store'
import { AppConfig } from '../../../shared/types'
import { DEFAULT_CONCURRENCY, DEFAULT_IGNORE_DIRS } from '../../../shared/constants'

const store = new Store<AppConfig>({
  defaults: {
    concurrency: DEFAULT_CONCURRENCY,
    ignoreDirs: [...DEFAULT_IGNORE_DIRS]
  }
})

export const configStore = {
  getConfig: (): AppConfig => store.store,
  setLastRootPath: (path: string) => store.set('lastRootPath', path),
  getLastRootPath: (): string | undefined => store.get('lastRootPath')
}
