import { Injectable } from '@nestjs/common/decorators/core'
import { google } from 'googleapis'
import { OAuth2Client } from 'googleapis-common'

interface AuthCodeRequest {
  code: string
  redirect_uri: string
  grant_type: 'authorization_code' | 'refresh_token'
}

interface RefreshTokenRequest {
  code: string
  refresh_token: string
  grant_type: 'authorization_code' | 'refresh_token'
}

interface AuthCodeResponse {
  access_token: string
  expires_in: number
  refresh_token: string
  scope: string
  token_type: string
}

interface AuthRefreshedResponse {
  access_token: string
  expires_in: number
  scope: string
  token_type: string
}

interface Credential {
  client_secret: string
  client_id: string
  redirect_uris: string[]
}

interface GoogleCredential {
  type: string
  project_id: string
  private_key_id: string
  private_key?: string
  client_email?: string
  client_id: string
  auth_uri?: string
  token_uri?: string
  auth_provider_x509_cert_url?: string
  client_x509_cert_url?: string
}

@Injectable()
export class GoogleOAuthService {
  private readonly credential: Credential
  private readonly serviceAccount: GoogleCredential

  constructor() {
    this.serviceAccount = JSON.parse(
      process.env.GOOGLE_APPLICATION_JSON ?? ''
    ) as GoogleCredential
    this.credential = {
      client_secret: process.env.CLIENT_SECRET ?? '',
      client_id: (
        JSON.parse(process.env.GOOGLE_APPLICATION_JSON ?? '{}') as {
          client_id: string
        }
      ).client_id,
      redirect_uris: ['https://localhost:4200']
    }
  }

  authorize(token: string, scope: string): OAuth2Client {
    const oAuth2Client = new google.auth.OAuth2(
      this.credential.client_id,
      this.credential.client_secret,
      this.credential.redirect_uris[0]
    )
    oAuth2Client.setCredentials({
      access_token: token,
      scope
    })
    return oAuth2Client
  }

  async getAccessToken(req: AuthCodeRequest): Promise<AuthCodeResponse> {
    const reqBody = new FormData()
    reqBody.append('client_id', this.credential.client_id)
    reqBody.append('client_secret', this.credential.client_secret)
    reqBody.append('redirect_uri', req.redirect_uri)
    reqBody.append('grant_type', req.grant_type)
    reqBody.append('code', req.code)

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      body: reqBody
    })

    return await response.json()
  }

  async getRefreshedToken(
    req: RefreshTokenRequest
  ): Promise<AuthRefreshedResponse> {
    const reqBody = new FormData()
    reqBody.append('client_id', this.credential.client_id)
    reqBody.append('client_secret', this.credential.client_secret)
    reqBody.append('grant_type', req.grant_type)
    reqBody.append('refresh_token', req.refresh_token)

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      body: reqBody
    })

    return await response.json()
  }

  async getNewAccessToken(refreshToken: string): Promise<string> {
    const reqBody = new URLSearchParams({
      client_id: this.credential.client_id,
      client_secret: this.credential.client_secret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    })

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: reqBody
    })

    const data = await response.json()
    return data.access_token
  }

  async exchangeAuthCodeForTokens(
    authCode: string,
    redirectUri: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const reqBody = new URLSearchParams({
      code: authCode,
      client_id: this.credential.client_id,
      client_secret: this.credential.client_secret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    })

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: reqBody
    })

    const data = await response.json()
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token
    }
  }
}
