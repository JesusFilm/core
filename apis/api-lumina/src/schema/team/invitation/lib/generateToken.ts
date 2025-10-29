import { createHash, randomBytes } from 'crypto'
import { promisify } from 'util'

const randomBytesPromise = promisify(randomBytes)

function base64url(buffer: Buffer) {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

export async function generateToken(
  bytes = 32
): Promise<{ token: string; hash: string }> {
  const buf = await randomBytesPromise(bytes)
  const token = base64url(buf)
  const hash = generateTokenHash(token)
  return { token, hash }
}

export function generateTokenHash(input: string): string {
  return createHash('sha256').update(input, 'utf8').digest('hex')
}
