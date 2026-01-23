import { create } from 'zustand'

interface MasterPasswordStore {
  sessionKey: string | null // derived key, not the actual password
  unlocked: boolean
  setSessionKey: (key: string) => void
  clearSession: () => void
}

export const useMasterPasswordStore = create<MasterPasswordStore>((set) => ({
  sessionKey: null,
  unlocked: false,
  setSessionKey: (key) => set({ sessionKey: key, unlocked: true }),
  clearSession: () => set({ sessionKey: null, unlocked: false })
}))
