import { create } from 'zustand'

export type SettingsData = {
  autoLockMinutes: number
  clipboardSeconds: number
}

type SettingsState = {
  autoLockMinutes: number
  clipboardSeconds: number
  load: () => Promise<void>
  update: (partial: Partial<SettingsData>) => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  autoLockMinutes: 5,
  clipboardSeconds: 15,

  load: async () => {
    try {
      const s = await window.settings.get()
      set({
        autoLockMinutes: s.autoLockMinutes ?? 5,
        clipboardSeconds: s.clipboardSeconds ?? 15
      })
    } catch {
      return
    }
  },

  update: async (partial) => {
    const { load, update, ...current } = get()
    const next = { ...current, ...partial }

    await window.settings.set(next)
    set(next)
  }
}))
