import Store from 'electron-store'
// or try:
// import * as Store from 'electron-store'

export interface AppSettings {
  autoLockMinutes: number
  clipboardClearSeconds: number
}

export const settingsStore = new Store<AppSettings>({
  name: 'settings',
  defaults: {
    autoLockMinutes: 5,
    clipboardClearSeconds: 15
  }
})
