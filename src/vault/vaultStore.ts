import * as crypto from 'crypto'
import * as fs from 'fs'
import * as path from 'path'
import { app } from 'electron'
import { deriveKey } from './crypto'
import type { Secret } from '../types/vault'
import type { VaultData } from './vaultUnlock'

const VAULT_PATH = path.join(app.getPath('userData'), 'vault.json')

/**
 * Reads the vault JSON file.
 */
function readVaultFile(): VaultData {
  if (!fs.existsSync(VAULT_PATH)) throw new Error('Vault file does not exist')
  return JSON.parse(fs.readFileSync(VAULT_PATH, 'utf-8'))
}

/**
 * Writes vault data back to disk
 */
function writeVaultFile(data: VaultData): void {
  fs.writeFileSync(VAULT_PATH, JSON.stringify(data, null, 2), 'utf-8')
}

/**
 * Encrypts data with AES-256-GCM using the master key
 */
function encryptSecrets(key: Buffer, secrets: Secret[]): string {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(secrets), 'utf-8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, encrypted, tag]).toString('base64')
}

/**
 * Decrypts secrets from AES-256-GCM
 */
function decryptSecrets(key: Buffer, encryptedData: string): Secret[] {
  const data = Buffer.from(encryptedData, 'base64')
  const iv = data.subarray(0, 12)
  const tag = data.subarray(data.length - 16)
  const encrypted = data.subarray(12, data.length - 16)

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(tag)
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])
  return JSON.parse(decrypted.toString('utf-8'))
}

/**
 * VaultStore: manage secrets
 */
export const vaultStore = {
  /**
   * Get all secrets
   */
  getSecrets(password: string): Secret[] {
    const vault = readVaultFile()
    const key = deriveKey(password, Buffer.from(vault.salt, 'base64'))

    if (!vault.secretsEncrypted) return vault.secrets || []

    return decryptSecrets(key, vault.secretsEncrypted)
  },

  /**
   * Add a new secret
   */
  addSecret(password: string, secret: Omit<Secret, 'id' | 'createdAt' | 'lastAccessed'>): Secret {
    const vault = readVaultFile()
    const key = deriveKey(password, Buffer.from(vault.salt, 'base64'))

    const newSecret: Secret = {
      ...secret,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      lastAccessed: new Date()
    }

    const secrets = vault.secretsEncrypted
      ? decryptSecrets(key, vault.secretsEncrypted)
      : vault.secrets || []
    secrets.push(newSecret)

    vault.secretsEncrypted = encryptSecrets(key, secrets)
    vault.secrets = [] // clear plain secrets
    writeVaultFile(vault)

    return newSecret
  },

  /**
   * Edit an existing secret
   */
  editSecret(password: string, updatedSecret: Secret) {
    const vault = readVaultFile()
    const key = deriveKey(password, Buffer.from(vault.salt, 'base64'))

    const secrets = vault.secretsEncrypted
      ? decryptSecrets(key, vault.secretsEncrypted)
      : vault.secrets || []
    const index = secrets.findIndex((s) => s.id === updatedSecret.id)
    if (index === -1) throw new Error('Secret not found')

    secrets[index] = { ...updatedSecret, lastAccessed: new Date() }

    vault.secretsEncrypted = encryptSecrets(key, secrets)
    vault.secrets = []
    writeVaultFile(vault)
  },

  /**
   * Delete a secret
   */
  deleteSecret(password: string, secretId: string) {
    const vault = readVaultFile()
    const key = deriveKey(password, Buffer.from(vault.salt, 'base64'))

    const secrets = vault.secretsEncrypted
      ? decryptSecrets(key, vault.secretsEncrypted)
      : vault.secrets || []
    const filtered = secrets.filter((s) => s.id !== secretId)

    vault.secretsEncrypted = encryptSecrets(key, filtered)
    vault.secrets = []
    writeVaultFile(vault)
  }
}
