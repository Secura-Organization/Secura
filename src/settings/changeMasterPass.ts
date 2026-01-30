import * as crypto from 'crypto'
import * as fs from 'fs'
import { deriveKey } from '../vault/crypto'
import { VAULT_PATH, VaultData } from '../vault/vaultUnlock'
import { decryptSecrets, encryptSecrets } from '../vault/vaultStore'
import { Secret } from '../types/vault'
import { setSessionKey } from '../vault/vaultSession'

/**
 * Change master password safely
 * @param sessionKey The current session key (Buffer as base64 string)
 * @param oldPassword The current password (for verification)
 * @param newPassword The new password you want
 */
export async function changeMasterPassword(
  oldPassword: string,
  newPassword: string
): Promise<boolean> {
  try {
    if (!fs.existsSync(VAULT_PATH)) {
      return false
    }

    const vault: VaultData = JSON.parse(fs.readFileSync(VAULT_PATH, 'utf-8'))

    // Step 1: Derive key from old password and CURRENT salt
    const oldSalt = Buffer.from(vault.salt, 'base64')
    const oldKey = await deriveKey(oldPassword, oldSalt)

    // Step 2: Verify old password using verifier

    try {
      const verifier = Buffer.from(vault.verifier, 'base64')
      const iv = verifier.subarray(0, 12)
      const tag = verifier.subarray(verifier.length - 16)
      const encrypted = verifier.subarray(12, verifier.length - 16)

      const decipher = crypto.createDecipheriv('aes-256-gcm', oldKey, iv)
      decipher.setAuthTag(tag)
      const decryptedVerifier = Buffer.concat([decipher.update(encrypted), decipher.final()])

      if (decryptedVerifier.toString() !== 'vault-check') {
        return false
      }
    } catch {
      return false
    }

    // Step 2: Use session key for decryption

    let secrets: Secret[] = []
    // Convert comma-separated sessionKey string to Buffer

    if (vault.secretsEncrypted) {
      try {
        secrets = decryptSecrets(oldKey, vault.secretsEncrypted)
      } catch {
        return false
      }
    }

    // Step 3: Generate NEW salt and derive NEW key

    //create new key same as in unlock mechanism
    const newSalt = crypto.randomBytes(16)
    const newKey = await deriveKey(newPassword, newSalt)

    // Step 4: Create new verifier with new key

    const newIv = crypto.randomBytes(12)
    const cipher = crypto.createCipheriv('aes-256-gcm', newKey, newIv)
    const newEncryptedVerifier = Buffer.concat([
      cipher.update('vault-check', 'utf-8'),
      cipher.final()
    ])
    const newTag = cipher.getAuthTag()
    const newVerifier = Buffer.concat([newIv, newEncryptedVerifier, newTag])

    // Step 5: Encrypt secrets with NEW key

    let newSecretsEncrypted: string | undefined = undefined

    if (secrets.length > 0) {
      newSecretsEncrypted = encryptSecrets(newKey, secrets)
    }

    // Step 6: Update vault with new credentials

    vault.salt = newSalt.toString('base64')
    vault.verifier = newVerifier.toString('base64')
    vault.secrets = []
    vault.secretsEncrypted = newSecretsEncrypted

    // Step 7: Save to disk
    fs.writeFileSync(VAULT_PATH, JSON.stringify(vault, null, 2), 'utf-8')

    setSessionKey(newKey)
    return true
  } catch {
    return false
  }
}
