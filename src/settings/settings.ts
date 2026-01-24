import { app } from 'electron'
import fs from 'fs'
import path from 'path'

const SETTINGS_PATH = path.join(app.getPath('userData'), 'settings.json')

export type AppSettings = {
  autoLockMinutes: number
  clipboardSeconds: number
}

const DEFAULT_SETTINGS: AppSettings = {
  autoLockMinutes: 5,
  clipboardSeconds: 15
}

export function loadSettings(): AppSettings {
  try {
    if (!fs.existsSync(SETTINGS_PATH)) {
      fs.writeFileSync(SETTINGS_PATH, JSON.stringify(DEFAULT_SETTINGS, null, 2))
      return DEFAULT_SETTINGS
    }

    return {
      ...DEFAULT_SETTINGS,
      ...JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf-8'))
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: AppSettings): void {
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2))
}
