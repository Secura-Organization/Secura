import * as crypto from 'crypto'

export function deriveKey(password: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(
    password,
    salt,
    310000, // slows down attackers
    32, // 256-bit key
    'sha256'
  )
}
