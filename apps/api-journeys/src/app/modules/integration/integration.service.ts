import crypto from 'node:crypto'
import { Injectable } from '@nestjs/common'

@Injectable()
export class IntegrationService {
  async encryptSymmetric(key: string, plaintext: string) {
    const iv = crypto.randomBytes(12).toString('base64')
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
    let ciphertext = cipher.update(plaintext, 'utf8', 'base64')
    ciphertext += cipher.final('base64')
    const tag = cipher.getAuthTag().toString('base64')
    return { ciphertext, iv, tag }
  }

  async decryptSymmetric(
    key: string,
    ciphertext: string,
    iv: string,
    tag: string
  ) {
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      Buffer.from(key, 'base64'),
      Buffer.from(iv, 'base64')
    )

    decipher.setAuthTag(Buffer.from(tag, 'base64'))

    let plaintext = decipher.update(ciphertext, 'base64', 'utf8')
    plaintext += decipher.final('utf8')

    return plaintext
  }
}
