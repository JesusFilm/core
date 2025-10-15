import { Injectable } from '@nestjs/common'
import axios from 'axios'
import { GraphQLError } from 'graphql'

import { encryptSymmetric } from '@core/nest/common/crypto'
import { IntegrationType, Prisma } from '@core/prisma/journeys/client'

import { PrismaService } from '../../../lib/prisma.service'

interface GoogleTokenResponse {
  access_token: string
  refresh_token?: string
  expires_in: number
  scope: string
  token_type: string
}

@Injectable()
export class IntegrationGoogleService {
  constructor(private readonly prisma: PrismaService) {}

  private get clientId(): string {
    if (process.env.GOOGLE_CLIENT_ID == null)
      throw new GraphQLError('GOOGLE_CLIENT_ID not configured')
    return process.env.GOOGLE_CLIENT_ID
  }

  private get clientSecret(): string {
    if (process.env.GOOGLE_CLIENT_SECRET == null)
      throw new GraphQLError('GOOGLE_CLIENT_SECRET not configured')
    return process.env.GOOGLE_CLIENT_SECRET
  }

  async exchangeCodeForTokens(input: {
    code: string
    redirectUri: string
  }): Promise<{ accessToken: string }> {
    try {
      const params = new URLSearchParams({
        code: input.code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: input.redirectUri,
        grant_type: 'authorization_code'
      })
      const res = await axios.post<GoogleTokenResponse>(
        'https://oauth2.googleapis.com/token',
        params,
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }
      )
      return { accessToken: res.data.access_token }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'OAuth exchange failed'
      throw new GraphQLError(message, {
        extensions: { code: 'BAD_USER_INPUT' }
      })
    }
  }

  async create(
    input: { teamId: string; code: string; redirectUri: string },
    tx: Prisma.TransactionClient
  ) {
    const { accessToken } = await this.exchangeCodeForTokens(input)
    const { ciphertext, iv, tag } = await encryptSymmetric(
      accessToken,
      process.env.INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET
    )
    return await tx.integration.create({
      data: {
        type: IntegrationType.google,
        teamId: input.teamId,
        accessId: 'oauth2',
        accessSecretPart: accessToken.slice(0, 6),
        accessSecretCipherText: ciphertext,
        accessSecretIv: iv,
        accessSecretTag: tag
      },
      include: { team: { include: { userTeams: true } } }
    })
  }

  async update(id: string, input: { code: string; redirectUri: string }) {
    const { accessToken } = await this.exchangeCodeForTokens(input)
    const { ciphertext, iv, tag } = await encryptSymmetric(
      accessToken,
      process.env.INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET
    )
    return await this.prisma.integration.update({
      where: { id },
      data: {
        accessId: 'oauth2',
        accessSecretPart: accessToken.slice(0, 6),
        accessSecretCipherText: ciphertext,
        accessSecretIv: iv,
        accessSecretTag: tag
      }
    })
  }
}
