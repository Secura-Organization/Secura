import { app, shell, BrowserWindow, ipcMain, clipboard, powerMonitor } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icons/icon.png?asset'
import { unlockVault } from '../vault/vaultUnlock'
import { vaultStore } from '../vault/vaultStore'
import { loadSettings, saveSettings } from '../settings/settings'
import { changeMasterPassword } from '../settings/changeMasterPass'
import { clearSessionKey } from '../vault/vaultSession'
import { unlockVaultWithRateLimit } from '../vault/vaultRateLimiter'

function createWindow(): BrowserWindow {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    show: false,
    frame: false,
    autoHideMenuBar: true,
    icon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      sandbox: false
    }
  })

  if (!is.dev) {
    mainWindow.webContents.on('before-input-event', (event, input) => {
      if (input.control && input.shift && input.key.toLowerCase() === 'i') {
        event.preventDefault()
      }

      if (input.key === 'F12') {
        event.preventDefault()
      }
    })
  }

  if (!is.dev) {
    mainWindow.webContents.on('devtools-opened', () => {
      mainWindow.webContents.closeDevTools()
    })
  }

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('minimize', () => {
    mainWindow.webContents.send('system-lock')
    clearSessionKey()
  })

  // --- System Lock / Unlock Detection ---
  powerMonitor.on('lock-screen', () => {
    mainWindow.webContents.send('system-lock') // notify renderer to lock vault
    clearSessionKey()
  })

  powerMonitor.on('suspend', () => {
    mainWindow.webContents.send('system-lock')
    clearSessionKey()
  })

  return mainWindow
}

// --- Window controls ---
ipcMain.on('window-minimize', () => {
  const win = BrowserWindow.getFocusedWindow()
  win?.minimize()
})

ipcMain.on('window-maximize', () => {
  const win = BrowserWindow.getFocusedWindow()
  if (win?.isMaximized()) win.unmaximize()
  else win?.maximize()
})

ipcMain.on('window-close', () => {
  const win = BrowserWindow.getFocusedWindow()
  win?.close()
})

// --- Vault IPC ---
ipcMain.handle('vault:unlock', async (_, password: string) => {
  return unlockVaultWithRateLimit(password)
})
ipcMain.handle('vault:getSecrets', async () => vaultStore.getSecrets())
ipcMain.handle('vault:addSecret', async (_event, secret) => vaultStore.addSecret(secret))
ipcMain.handle('vault:editSecret', async (_event, secret) => vaultStore.editSecret(secret))
ipcMain.handle('vault:deleteSecret', async (_event, secretId: string) =>
  vaultStore.deleteSecret(secretId)
)
ipcMain.handle('vault:download', async () => {
  return vaultStore.downloadVault()
})
ipcMain.handle('vault:import', async () => {
  return vaultStore.importVault()
})

// --- Settings IPC ---
ipcMain.handle('settings:get', () => {
  const settings = loadSettings()
  return settings
})

ipcMain.handle('settings:set', (_, settings) => {
  saveSettings(settings)
})

ipcMain.handle('settings:changeMasterPass', async (_, oldPass: string, newPass: string) => {
  const result = await changeMasterPassword(oldPass, newPass)
  return result
})

// --- App lifecycle ---
app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('before-quit', () => {
  clipboard.writeText('') // clear clipboard on exit
  clearSessionKey()
})
