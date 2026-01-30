import { AppSettings } from '../../settings/settings'
import { Secret } from '../../types/vault'

declare global {
  interface Window {
    electron: typeof import('../../preload').mergedElectronAPI
    api: unknown
    vault: {
      unlock: (password: string) => Promise<{ success: boolean; waitTime?: number }>
      getSecrets: () => Promise<Secret[]>
      addSecret: (secret: Omit<Secret, 'id' | 'createdAt' | 'lastAccessed'>) => Promise<Secret>
      editSecret: (secret: Secret) => Promise<void>
      deleteSecret: (secretId: string) => Promise<void>
      downloadVault: () => Promise<boolean>
      importVault: () => Promise<boolean>
    }
    settings: {
      get: () => Promise<AppSettings>
      set: (settings: AppSettings) => Promise<void>
      changeMasterPassword: (oldPass: string, newPass: string) => Promise<boolean>
    }
  }
}

export {}
