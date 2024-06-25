import crypto from 'node:crypto'
import { Injectable } from '@nestjs/common'
import { GraphQLError } from 'graphql/error'
import { IntegrationInput } from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'
import { Integration } from '.prisma/api-journeys-client'

export interface EncryptResponse {
  ciphertext: string
  iv: string
  tag: string
}

@Injectable()
export class IntegrationService {
  constructor(private readonly prismaService: PrismaService) {}
  async encryptSymmetric(
    plaintext: string,
    key: string | undefined
  ): Promise<EncryptResponse> {
    if (key == null)
      throw new GraphQLError('no crypto key', {
        extensions: { code: 'INTERNAL_SERVER_ERROR' }
      })
    const iv = crypto.randomBytes(12).toString('base64')
    const cipher = crypto.createCipheriv(
      'aes-256-gcm',
      Buffer.from(key, 'base64'),
      Buffer.from(iv, 'base64')
    )
    let ciphertext = cipher.update(plaintext, 'utf8', 'base64')
    ciphertext += cipher.final('base64')
    const tag = cipher.getAuthTag().toString('base64')
    return { ciphertext, iv, tag }
  }

  async decryptSymmetric(
    ciphertext: string,
    iv: string,
    tag: string,
    key?: string | undefined
  ): Promise<string> {
    if (key == null)
      throw new GraphQLError('no crypto key', {
        extensions: { code: 'INTERNAL_SERVER_ERROR' }
      })
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

  async delete(input: IntegrationInput): Promise<Integration> {
    return await this.prismaService.integration.delete({
      where: { id: input.id }
    })
  }
}
