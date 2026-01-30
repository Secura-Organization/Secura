let sessionKey: Buffer | null = null

export function setSessionKey(key: Buffer): void {
  sessionKey = key
}

export function clearSessionKey(): void {
  sessionKey = null
}

export function getSessionKey(): Buffer {
  if (!sessionKey) {
    throw new Error('Vault is locked')
  }
  return sessionKey
}
