import crypto from 'crypto'

export function encrypt(
  message: string
): [key: string, iv: string, encrypted: string] {
  const key = crypto.randomBytes(16).toString('hex')
  const iv = crypto.randomBytes(16).toString('hex')
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    key,
    Buffer.from(iv, 'hex')
  )
  const encrypted = cipher.update(message, 'utf-8', 'hex') + cipher.final('hex')

  return [key, iv, encrypted.toString()]
}
