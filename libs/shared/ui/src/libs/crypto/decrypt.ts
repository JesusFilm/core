import crypto from 'crypto'

export function decrypt(
  encrypt: [key: string, iv: string, encrypted: string]
): string {
  const [key, iv, encrypted] = encrypt
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    key,
    Buffer.from(iv, 'hex')
  )

  const decrpyted = Buffer.concat([
    decipher.update(Buffer.from(encrypted, 'hex')),
    decipher.final()
  ])

  return decrpyted.toString()
}
