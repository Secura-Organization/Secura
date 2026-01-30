import { create } from 'zustand'

interface MasterPasswordStore {
  unlocked: boolean
  setUnlocked: (val: boolean) => void
  clearSession: () => void
}

export const useMasterPasswordStore = create<MasterPasswordStore>((set) => ({
  unlocked: false,
  setUnlocked: (val) => set({ unlocked: val }),
  clearSession: () => set({ unlocked: false })
}))
