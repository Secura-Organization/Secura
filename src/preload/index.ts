import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI as toolkitAPI } from '@electron-toolkit/preload'
import { Secret } from '../types/vault'

export interface CustomElectronAPI {
  onSystemLock: (callback: () => void) => void
}

const customAPI: CustomElectronAPI = {
  onSystemLock: (callback) => ipcRenderer.on('system-lock', callback)
}

const mergedElectronAPI = { ...toolkitAPI, ...customAPI }

contextBridge.exposeInMainWorld('electron', mergedElectronAPI)

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close')
})

contextBridge.exposeInMainWorld('vault', {
  unlock: (password: string) => ipcRenderer.invoke('vault:unlock', password),
  getSecrets: () => ipcRenderer.invoke('vault:getSecrets') as Promise<Secret[]>,
  addSecret: (secret: Omit<Secret, 'id' | 'createdAt' | 'lastAccessed'>) =>
    ipcRenderer.invoke('vault:addSecret', secret) as Promise<Secret>,
  editSecret: (secret: Secret) => ipcRenderer.invoke('vault:editSecret', secret) as Promise<void>,
  deleteSecret: (secretId: string) =>
    ipcRenderer.invoke('vault:deleteSecret', secretId) as Promise<void>,
  downloadVault: () => ipcRenderer.invoke('vault:download') as Promise<boolean>,
  importVault: () => ipcRenderer.invoke('vault:import') as Promise<boolean>
})

contextBridge.exposeInMainWorld('settings', {
  get: () => ipcRenderer.invoke('settings:get'),
  set: (settings) => ipcRenderer.invoke('settings:set', settings),
  changeMasterPassword: (oldPass: string, newPass: string): Promise<boolean> =>
    ipcRenderer.invoke('settings:changeMasterPass', oldPass, newPass)
})
