import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { Secret } from '../types/vault'

// Custom APIs for renderer
const api = {}

// Use `contextBridge` APIs to expose Electron APIs to

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
    ipcRenderer.invoke('vault:deleteSecret', password, secretId) as Promise<void>
})

// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
