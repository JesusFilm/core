import axios, { isAxiosError } from 'axios'

import { decryptSymmetric } from '@core/nest/common/crypto'
import { prisma } from '@core/prisma/journeys/client'

import { logger } from '../../logger'

export interface GoogleAuthResult {
  accessToken: string
  accountEmail?: string | null
}

interface IntegrationTokenData {
  accessSecretCipherText: string | null
  accessSecretIv: string | null
  accessSecretTag: string | null
  accountEmail?: string | null
}

interface RefreshGoogleTokenContext {
  integrationId?: string
  teamId?: string
  [key: string]: unknown
}

async function refreshGoogleToken(
  integration: IntegrationTokenData,
  errorMessage: string,
  context?: RefreshGoogleTokenContext
): Promise<GoogleAuthResult> {
  if (
    integration.accessSecretCipherText == null ||
    integration.accessSecretIv == null ||
    integration.accessSecretTag == null
  ) {
    throw new Error(errorMessage)
  }

  const encryptionSecret = process.env.INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET
  if (encryptionSecret == null || encryptionSecret.trim() === '') {
    throw new Error(
      'INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET environment variable is not configured. This variable is required to decrypt integration access keys for Google OAuth tokens.'
    )
  }

  const secret = await decryptSymmetric(
    integration.accessSecretCipherText,
    integration.accessSecretIv,
    integration.accessSecretTag,
    encryptionSecret
  )

  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET

  if (clientId == null || clientSecret == null) {
    throw new Error('Google OAuth client is not configured')
  }

  // Try to use secret as refresh_token first
  try {
    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
      refresh_token: secret
    })
    const res = await axios.post(
      'https://oauth2.googleapis.com/token',
      params,
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 10000
      }
    )
    if (typeof res.data?.access_token === 'string') {
      return {
        accessToken: res.data.access_token,
        accountEmail: integration.accountEmail
      }
    }
  } catch (error) {
    const errorDetails: Record<string, unknown> = {
      ...context,
      message: error instanceof Error ? error.message : String(error)
    }

    if (error instanceof Error && error.stack != null) {
      errorDetails.stack = error.stack
    }

    if (isAxiosError(error)) {
      errorDetails.responseStatus = error.response?.status
      errorDetails.responseData = error.response?.data
    }

    logger.warn(
      errorDetails,
      'Failed to refresh Google OAuth token, falling back to treating secret as access token'
    )
  }

  // Fallback: treat secret as access_token
  return { accessToken: secret, accountEmail: integration.accountEmail }
}

export async function getTeamGoogleAccessToken(
  teamId: string
): Promise<GoogleAuthResult> {
  const integration = await prisma.integration.findFirst({
    where: { teamId, type: 'google' },
    select: {
      id: true,
      accessSecretCipherText: true,
      accessSecretIv: true,
      accessSecretTag: true,
      accountEmail: true
    }
  })

  if (integration == null) {
    throw new Error('Google integration not configured for this team')
  }

  return refreshGoogleToken(
    integration,
    'Google integration not configured for this team',
    { integrationId: integration.id, teamId }
  )
}

export async function getIntegrationGoogleAccessToken(
  integrationId: string
): Promise<GoogleAuthResult> {
  const integration = await prisma.integration.findUnique({
    where: { id: integrationId },
    select: {
      accessSecretCipherText: true,
      accessSecretIv: true,
      accessSecretTag: true,
      accountEmail: true
    }
  })

  if (integration == null) {
    throw new Error('Google integration not found')
  }

  return refreshGoogleToken(integration, 'Google integration not found', {
    integrationId
  })
}
