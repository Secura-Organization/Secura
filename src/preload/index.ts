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
  getSecrets: (password: string) =>
    ipcRenderer.invoke('vault:getSecrets', password) as Promise<Secret[]>,
  addSecret: (password: string, secret: Omit<Secret, 'id' | 'createdAt' | 'lastAccessed'>) =>
    ipcRenderer.invoke('vault:addSecret', password, secret) as Promise<Secret>,
  editSecret: (password: string, secret: Secret) =>
    ipcRenderer.invoke('vault:editSecret', password, secret) as Promise<void>,
  deleteSecret: (password: string, secretId: string) =>
    ipcRenderer.invoke('vault:deleteSecret', password, secretId) as Promise<void>,
  downloadVault: () => ipcRenderer.invoke('vault:download') as Promise<void>
})

contextBridge.exposeInMainWorld('settings', {
  get: () => ipcRenderer.invoke('settings:get'),
  set: (settings) => ipcRenderer.invoke('settings:set', settings),
  changeMasterPassword: (oldPass: string, newPass: string): Promise<boolean> =>
    ipcRenderer.invoke('settings:changeMasterPass', oldPass, newPass)
})
