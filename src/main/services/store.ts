import Store from 'electron-store'
import { AppConfig, SavedEnvService } from '../../../shared/types'
import { DEFAULT_CONCURRENCY, DEFAULT_IGNORE_DIRS } from '../../../shared/constants'

const store = new Store<AppConfig>({
  defaults: {
    concurrency: DEFAULT_CONCURRENCY,
    ignoreDirs: [...DEFAULT_IGNORE_DIRS],
    envServices: []
  }
})

export const configStore = {
  getConfig: (): AppConfig => store.store,
  setLastRootPath: (path: string) => store.set('lastRootPath', path),
  getLastRootPath: (): string | undefined => store.get('lastRootPath'),
  getEnvServices: (): SavedEnvService[] => store.get('envServices') || [],
  setEnvServices: (services: SavedEnvService[]) => store.set('envServices', services),
}
