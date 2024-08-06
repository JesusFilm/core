import { Injectable } from '@nestjs/common/decorators/core'
import { google } from 'googleapis'
import { OAuth2Client } from 'googleapis-common'

interface Credential {
  client_secret: string
  client_id: string
  redirect_uris: string[]
}

@Injectable()
export class GoogleOAuthService {
  private readonly credential: Credential
  constructor() {
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
}
