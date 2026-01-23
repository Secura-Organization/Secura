import { app } from 'electron'
import * as crypto from 'crypto'
import * as fs from 'fs'
import * as path from 'path'
import { deriveKey } from './crypto'
import type { Secret } from '../types/vault'

const VAULT_PATH = path.join(app.getPath('userData'), 'vault.json')

export interface VaultData {
  salt: string // base64
  verifier: string // base64
  secrets: Secret[]
  secretsEncrypted?: string // base64 AES-256-GCM
}

/**
 * Unlocks the vault if it exists, or sets up a new vault if missing.
 * @param password The master password entered by the user
 * @returns true if unlock or setup succeeds, false otherwise
 */
export function unlockVault(password: string): { key: Buffer } | null {
  // --- First-time setup
  if (!fs.existsSync(VAULT_PATH)) {
    // console.log('Vault file not found. Creating a new vault...')

    try {
      const salt = crypto.randomBytes(16)
      const key = deriveKey(password, salt)
      const iv = crypto.randomBytes(12)

      // Encrypt a verifier string
      const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
      const encrypted = Buffer.concat([cipher.update('vault-check', 'utf-8'), cipher.final()])
      const tag = cipher.getAuthTag()
      const verifier = Buffer.concat([iv, encrypted, tag])

      const vaultData: VaultData = {
        salt: salt.toString('base64'),
        verifier: verifier.toString('base64'),
        secrets: []
      }

      fs.writeFileSync(VAULT_PATH, JSON.stringify(vaultData, null, 2), 'utf-8')
      // console.log('Vault successfully created!')
      return { key }
    } catch {
      // console.error('Failed to create vault:', err)
      return null
    }
  }

  // --- Unlock existing vault
  try {
    const data: VaultData = JSON.parse(fs.readFileSync(VAULT_PATH, 'utf-8'))
    const salt = Buffer.from(data.salt, 'base64')
    const key = deriveKey(password, salt)
    const verifier = Buffer.from(data.verifier, 'base64')

    const iv = verifier.subarray(0, 12)
    const tag = verifier.subarray(verifier.length - 16)
    const encrypted = verifier.subarray(12, verifier.length - 16)

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
    decipher.setAuthTag(tag)

    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])
    const unlocked = decrypted.toString() === 'vault-check'

    if (!unlocked) return null
    return { key }
  } catch {
    // console.error('Failed to unlock vault:', err)
    return null
  }
}
