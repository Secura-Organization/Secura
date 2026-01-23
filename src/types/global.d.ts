import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: unknown
    vault: {
      unlock: (password: string) => Promise<{ key: Buffer } | null>
      getSecrets: (password: string) => Promise<Secret[]>
      addSecret: (
        password: string,
        secret: Omit<Secret, 'id' | 'createdAt' | 'lastAccessed'>
      ) => Promise<Secret>
      editSecret: (password: string, secret: Secret) => Promise<void>
      deleteSecret: (password: string, secretId: string) => Promise<void>
    }
  }
}

export {}
