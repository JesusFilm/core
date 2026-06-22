import axios from 'axios'
import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'
import { encryptSymmetric } from '@core/yoga/crypto'

import { env } from '../../../env'
import { builder } from '../../builder'

import { IntegrationGoogleRef } from './google'
import { IntegrationGoogleUpdateInput } from './inputs/integrationGoogleUpdateInput'

interface GoogleTokenResponse {
  access_token: string
  expires_in: number
  scope: string
  token_type: string
  refresh_token?: string
}
interface GoogleUserInfoResponse {
  email?: string
  email_verified?: boolean
}

builder.mutationField('integrationGoogleUpdate', (t) =>
  t
    .withAuth((_parent, args) => ({
      $all: {
        isAuthenticated: true,
        isIntegrationOwner: args.id
      }
    }))
    .prismaField({
      type: IntegrationGoogleRef,
      nullable: false,
      args: {
        id: t.arg.id({ required: true }),
        input: t.arg({ type: IntegrationGoogleUpdateInput, required: true })
      },
      resolve: async (query, _parent, args, context) => {
        const { id, input } = args

        const clientId = env.GOOGLE_CLIENT_ID
        const clientSecret = env.GOOGLE_CLIENT_SECRET

        let accessToken: string
        let refreshToken: string | undefined
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
            {
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              timeout: 5000
            }
          )
          accessToken = res.data.access_token
          refreshToken = res.data.refresh_token
          const userInfo = await axios.get<GoogleUserInfoResponse>(
            'https://openidconnect.googleapis.com/v1/userinfo',
            {
              headers: { Authorization: `Bearer ${accessToken}` },
              timeout: 5000
            }
          )
          accountEmail = userInfo.data.email
        } catch (e) {
          const message =
            e instanceof Error ? e.message : 'OAuth exchange failed'
          throw new GraphQLError(message, {
            extensions: { code: 'BAD_USER_INPUT' }
          })
        }

        const encryptionSecret = env.INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET

        // Only store refresh token. If absent, reuse existing encrypted secret fields.
        if (refreshToken != null) {
          const secretToStore = refreshToken
          const { ciphertext, iv, tag } = await encryptSymmetric(
            secretToStore,
            encryptionSecret
          )

          return await prisma.integration.update({
            ...query,
            where: { id },
            data: {
              accessSecretCipherText: ciphertext,
              accessSecretIv: iv,
              accessSecretTag: tag,
              accountEmail,
              oauthStale: false // Clear stale flag on successful reconnection
            }
          })
        }

        // refreshToken is undefined, fail with clear guidance to re-authorize
        throw new GraphQLError(
          'A Google refresh token is required to complete the connection. Please re-authorize your Google account.',
          { extensions: { code: 'BAD_USER_INPUT' } }
        )
      }
    })
)
