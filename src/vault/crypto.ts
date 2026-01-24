import argon2 from 'argon2'

export async function deriveKey(password: string, salt: Buffer): Promise<Buffer> {
  const key = await argon2.hash(password, {
    type: argon2.argon2id,
    salt,
    hashLength: 32,
    raw: true,
    memoryCost: 2 ** 16,
    timeCost: 3,
    parallelism: 1
  })

  return Buffer.from(key)
}
