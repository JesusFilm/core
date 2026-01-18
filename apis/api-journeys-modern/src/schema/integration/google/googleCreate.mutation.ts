import axios, { type AxiosResponse } from 'axios'
import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'
import { encryptSymmetric } from '@core/yoga/crypto'

import { env } from '../../../env'
import { builder } from '../../builder'
import { logger } from '../../logger'

import { IntegrationGoogleRef } from './google'
import { IntegrationGoogleCreateInput } from './inputs/integrationGoogleCreateInput'

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
  error?: string
  error_description?: string
}

builder.mutationField('integrationGoogleCreate', (t) =>
  t
    .withAuth((_parent, args) => ({
      $all: {
        isAuthenticated: true,
        isInTeam: (
          args.input as typeof IntegrationGoogleCreateInput.$inferInput
        ).teamId
      }
    }))
    .prismaField({
      type: IntegrationGoogleRef,
      nullable: false,
      args: {
        input: t.arg({ type: IntegrationGoogleCreateInput, required: true })
      },
      resolve: async (_query, _parent, args, context) => {
        const { teamId, code, redirectUri } = args.input
        const userId = context.user.id

        const clientId = env.GOOGLE_CLIENT_ID
        const clientSecret = env.GOOGLE_CLIENT_SECRET
        const encryptionSecret = env.INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET

        let accessToken: string
        let refreshToken: string | undefined
        let userInfo: AxiosResponse<GoogleUserInfoResponse> | undefined
        let tokenResponse: AxiosResponse<GoogleTokenResponse> | undefined
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
            {
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              timeout: 5000
            }
          )
          tokenResponse = res
          accessToken = res.data.access_token
          refreshToken = res.data.refresh_token
          // fetch userinfo to get account email
          userInfo = await axios.get<GoogleUserInfoResponse>(
            'https://openidconnect.googleapis.com/v1/userinfo',
            {
              headers: { Authorization: `Bearer ${accessToken}` },
              timeout: 5000
            }
          )
        } catch (e) {
          // If it's already a GraphQLError, rethrow it
          if (e instanceof GraphQLError) {
            throw e
          }
          // Otherwise, wrap unexpected errors
          const error = e instanceof Error ? e : new Error(String(e))
          logger.error(
            {
              error: {
                message: error.message,
                stack: error.stack
              }
            },
            'OAuth exchange failed'
          )
          throw new GraphQLError('OAuth exchange failed', {
            extensions: { code: 'BAD_USER_INPUT' }
          })
        }

        // validate email presence - required for integration
        if (userInfo?.data.email == null || userInfo.data.email === '') {
          logger.error(
            {
              status: userInfo?.status,
              error: userInfo?.data.error,
              error_description: userInfo?.data.error_description,
              scopes: tokenResponse?.data.scope,
              emailPresent: userInfo?.data?.email != null
            },
            'Google userInfo response missing email - email scope not granted'
          )
          throw new GraphQLError(
            'Email scope not granted. Please grant the email scope when authorizing with Google.',
            {
              extensions: {
                code: 'BAD_USER_INPUT',
                suggestion:
                  'Ensure the Google OAuth consent screen requests the email scope (https://www.googleapis.com/auth/userinfo.email)'
              }
            }
          )
        }
        const accountEmail = userInfo.data.email

        // Check if user in team  already has a Google integration with this account email
        const existingIntegration = await prisma.integration.findUnique({
          where: {
            userId_teamId_type_accountEmail: {
              userId,
              teamId,
              type: 'google',
              accountEmail
            }
          }
        })

        if (existingIntegration != null) {
          throw new GraphQLError(
            `You have already linked this Google account (${accountEmail}). Please use the existing integration or remove it first.`,
            {
              extensions: { code: 'BAD_USER_INPUT' }
            }
          )
        }

        // Require refresh token; do not fall back to short-lived access token
        if (refreshToken == null || refreshToken === '') {
          logger.error(
            {
              scopes: tokenResponse?.data.scope,
              hasRefreshToken: false
            },
            'Google OAuth did not return a refresh token - offline access not granted'
          )
          throw new GraphQLError(
            'A Google refresh token is required to complete the connection. Please re-authorize your Google account.',
            {
              extensions: {
                code: 'BAD_USER_INPUT'
              }
            }
          )
        }

        const secretToStore = refreshToken

        const { ciphertext, iv, tag } = await encryptSymmetric(
          secretToStore,
          encryptionSecret
        )

        return await prisma.integration.create({
          ..._query,
          data: {
            type: 'google',
            teamId,
            userId,
            accessSecretCipherText: ciphertext,
            accessSecretIv: iv,
            accessSecretTag: tag,
            accountEmail
          }
        })
      }
    })
)
