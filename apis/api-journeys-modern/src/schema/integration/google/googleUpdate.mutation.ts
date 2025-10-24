import axios from 'axios'
import { GraphQLError } from 'graphql'

import { encryptSymmetric } from '@core/nest/common/crypto'
import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../../builder'

import { IntegrationGoogleRef } from './google'
import { IntegrationGoogleUpdateInput } from './inputs/integrationGoogleUpdateInput'

interface GoogleTokenResponse {
  access_token: string
  expires_in: number
  scope: string
  token_type: string
}
interface GoogleUserInfoResponse {
  email?: string
  email_verified?: boolean
}

builder.mutationField('integrationGoogleUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: IntegrationGoogleRef,
    nullable: false,
    args: {
      id: t.arg.id({ required: true }),
      input: t.arg({ type: IntegrationGoogleUpdateInput, required: true })
    },
    resolve: async (_query, _parent, args, context) => {
      const { id, input } = args
      const userId = context.user?.id
      if (userId == null) {
        throw new GraphQLError('unauthenticated', {
          extensions: { code: 'UNAUTHENTICATED' }
        })
      }

      // Only the user who created/owns the integration may update (reconnect)
      const existing = await prisma.integration.findUnique({
        where: { id },
        select: { userId: true }
      })
      if (existing == null)
        throw new GraphQLError('integration not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      if (existing.userId !== userId)
        throw new GraphQLError('user is not allowed to update integration', {
          extensions: { code: 'FORBIDDEN' }
        })

      const clientId = process.env.GOOGLE_CLIENT_ID
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET
      if (clientId == null)
        throw new GraphQLError('GOOGLE_CLIENT_ID not configured')
      if (clientSecret == null)
        throw new GraphQLError('GOOGLE_CLIENT_SECRET not configured')

      let accessToken: string
      let accountEmail: string | undefined
      try {
        const params = new URLSearchParams({
          code: input.code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: input.redirectUri,
          grant_type: 'authorization_code'
        })
        const res = await axios.post<GoogleTokenResponse>(
          'https://oauth2.googleapis.com/token',
          params,
          { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        )
        accessToken = res.data.access_token
        const userInfo = await axios.get<GoogleUserInfoResponse>(
          'https://openidconnect.googleapis.com/v1/userinfo',
          { headers: { Authorization: `Bearer ${accessToken}` } }
        )
        accountEmail = userInfo.data.email
      } catch (e) {
        const message = e instanceof Error ? e.message : 'OAuth exchange failed'
        throw new GraphQLError(message, {
          extensions: { code: 'BAD_USER_INPUT' }
        })
      }

      const { ciphertext, iv, tag } = await encryptSymmetric(
        accessToken,
        process.env.INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET
      )

      return await prisma.integration.update({
        where: { id },
        data: {
          userId,
          accessId: 'oauth2',
          accessSecretPart: accessToken.slice(0, 6),
          accessSecretCipherText: ciphertext,
          accessSecretIv: iv,
          accessSecretTag: tag,
          accountEmail
        }
      })
    }
  })
)
