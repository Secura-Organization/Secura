import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: unknown
    vault: {
      setup: (password: string) => Promise<void>
      unlock: (password: string) => Promise<boolean>
    }
  }
}
