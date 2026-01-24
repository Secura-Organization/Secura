import * as crypto from 'crypto'
import * as fs from 'fs'
import { deriveKey } from '../vault/crypto'
import { VAULT_PATH, VaultData } from '../vault/vaultUnlock'

/**
 * Change master password
 * @param oldPassword The old master password
 * @param newPassword the new master password
 * @returns true if pass is changed, false otherwis
 */

export async function changeMasterPassword(
  oldPassword: string,
  newPassword: string
): Promise<boolean> {
  try {
    // --- 1. Load existing vault
    if (!fs.existsSync(VAULT_PATH)) return false
    const data: VaultData = JSON.parse(fs.readFileSync(VAULT_PATH, 'utf-8'))

    // --- 2. Verify old password
    const oldKey = await deriveKey(oldPassword, Buffer.from(data.salt, 'base64'))
    const verifier = Buffer.from(data.verifier, 'base64')

    try {
      const iv = verifier.subarray(0, 12)
      const tag = verifier.subarray(verifier.length - 16)
      const encrypted = verifier.subarray(12, verifier.length - 16)

      const decipher = crypto.createDecipheriv('aes-256-gcm', oldKey, iv)
      decipher.setAuthTag(tag)
      const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])

      if (decrypted.toString() !== 'vault-check') return false
    } catch {
      return false
    }

    // --- 3. Derive new key
    const newSalt = crypto.randomBytes(16)
    const newKey = await deriveKey(newPassword, newSalt)
    const newIv = crypto.randomBytes(12)

    // --- 4. Encrypt verifier with new key
    const cipher = crypto.createCipheriv('aes-256-gcm', newKey, newIv)
    const newEncrypted = Buffer.concat([cipher.update('vault-check', 'utf-8'), cipher.final()])
    const newTag = cipher.getAuthTag()
    const newVerifier = Buffer.concat([newIv, newEncrypted, newTag])

    // --- 5. Re-encrypt secrets if already stored encrypted
    let secretsEncrypted: string | undefined
    if (data.secretsEncrypted) {
      const oldSecretsBuffer = Buffer.from(data.secretsEncrypted, 'base64')
      const oldDecipher = crypto.createDecipheriv(
        'aes-256-gcm',
        oldKey,
        oldSecretsBuffer.subarray(0, 12)
      )
      oldDecipher.setAuthTag(oldSecretsBuffer.subarray(oldSecretsBuffer.length - 16))
      const decryptedSecrets = Buffer.concat([
        oldDecipher.update(oldSecretsBuffer.subarray(12, oldSecretsBuffer.length - 16)),
        oldDecipher.final()
      ])

      const newIv = crypto.randomBytes(12)
      const cipher = crypto.createCipheriv('aes-256-gcm', newKey, newIv)
      const encrypted = Buffer.concat([cipher.update(decryptedSecrets), cipher.final()])
      const tag = cipher.getAuthTag()
      secretsEncrypted = Buffer.concat([newIv, encrypted, tag]).toString('base64')
    }

    // --- 6. Save updated vault
    const updatedVault: VaultData = {
      salt: newSalt.toString('base64'),
      verifier: newVerifier.toString('base64'),
      secrets: data.secrets, // keep plaintext secrets if any
      secretsEncrypted
    }
    fs.writeFileSync(VAULT_PATH, JSON.stringify(updatedVault, null, 2), 'utf-8')
    return true
  } catch {
    return false
  }
}
