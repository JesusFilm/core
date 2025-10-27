import axios from 'axios'

import { decryptSymmetric } from '@core/nest/common/crypto'
import { prisma } from '@core/prisma/journeys/client'

export interface GoogleAuthResult {
  accessToken: string
  accountEmail?: string | null
}

export async function getTeamGoogleAccessToken(
  teamId: string
): Promise<GoogleAuthResult> {
  const integration = await prisma.integration.findFirst({
    where: { teamId, type: 'google' },
    select: {
      accessSecretCipherText: true,
      accessSecretIv: true,
      accessSecretTag: true,
      accountEmail: true
    }
  })

  if (
    integration?.accessSecretCipherText == null ||
    integration?.accessSecretIv == null ||
    integration?.accessSecretTag == null
  ) {
    throw new Error('Google integration not configured for this team')
  }

  const secret = await decryptSymmetric(
    integration.accessSecretCipherText,
    integration.accessSecretIv,
    integration.accessSecretTag,
    process.env.INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET
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
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    )
    if (typeof res.data?.access_token === 'string') {
      return {
        accessToken: res.data.access_token,
        accountEmail: integration.accountEmail
      }
    }
  } catch {
    // ignore and try treating secret as access token
  }

  // Fallback: treat secret as access_token
  return { accessToken: secret, accountEmail: integration.accountEmail }
}
