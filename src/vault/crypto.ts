import argon2 from 'argon2'

/**
 * Derive a 256-bit key from a password using Argon2id
 */
export async function deriveKey(password: string, salt: Buffer): Promise<Buffer> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    salt,
    hashLength: 32,
    raw: true,
    memoryCost: 2 ** 16,
    timeCost: 3,
    parallelism: 1
  }) as Promise<Buffer>
}
