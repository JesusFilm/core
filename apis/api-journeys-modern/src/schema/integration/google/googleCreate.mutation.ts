import axios from 'axios'
import { GraphQLError } from 'graphql'

import { encryptSymmetric } from '@core/nest/common/crypto'
import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../../builder'

import { IntegrationGoogleRef } from './google'
import { IntegrationGoogleCreateInput } from './inputs/integrationGoogleCreateInput'

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

builder.mutationField('integrationGoogleCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: IntegrationGoogleRef,
    nullable: false,
    args: {
      input: t.arg({ type: IntegrationGoogleCreateInput, required: true })
    },
    resolve: async (_query, _parent, args, context) => {
      const { teamId, code, redirectUri } = args.input
      const userId = context.user?.id
      if (userId == null) {
        throw new GraphQLError('unauthenticated', {
          extensions: { code: 'UNAUTHENTICATED' }
        })
      }

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
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code'
        })
        const res = await axios.post<GoogleTokenResponse>(
          'https://oauth2.googleapis.com/token',
          params,
          { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        )
        accessToken = res.data.access_token
        // fetch userinfo to get account email
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

      return await prisma.integration.create({
        data: {
          type: 'google',
          teamId,
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
