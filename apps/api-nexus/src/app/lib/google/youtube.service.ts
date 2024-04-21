import { createReadStream, statSync } from 'fs'

import { youtube } from '@googleapis/youtube'
import { Injectable } from '@nestjs/common/decorators/core'
import { OAuth2Client } from 'googleapis-common'

interface ChannelsRequest {
  accessToken: string
}

interface ChannelsResponse {
  kind: string
  etag: string
  items: Array<{
    kind: string
    etag: string
    id: string
    snippet: {
      title: string
      description: string
      customUrl: string
      publishedAt: string
      thumbnails: {
        default: {
          url: string
          width: number
          height: number
        }
        medium: {
          url: string
          width: number
          height: number
        }
        high: {
          url: string
          width: number
          height: number
        }
      }
    }
    localized: {
      title: string
      description: string
    }
  }>
}

interface Credential {
  client_secret: string
  client_id: string
  redirect_uris: string[]
}

@Injectable()
export class GoogleYoutubeService {
  private readonly credential: Credential
  rootUrl: string
  constructor() {
    this.rootUrl = 'https://www.googleapis.com/youtube/v3/channels'
    this.credential = {
      client_secret: process.env.CLIENT_SECRET ?? '',
      client_id: process.env.CLIENT_ID ?? '',
      redirect_uris: ['https://localhost:4200']
    }
  }

  async getChannels(req: ChannelsRequest): Promise<ChannelsResponse> {
    const channelsParam = {
      part: ['snippet'],
      mine: true
    }
    const params = new URLSearchParams()
    Object.entries(channelsParam).forEach(([key, value]) => {
      params.append(key, value.toString())
    })

    const response = await fetch(`${this.rootUrl}?${params.toString()}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${req.accessToken}`
      }
    })

    return await response.json()
  }

  authorize(token: string): OAuth2Client {
    const oAuth2Client = new OAuth2Client(
      this.credential.client_id,
      this.credential.client_secret,
      this.credential.redirect_uris[0]
    )
    oAuth2Client.setCredentials({
      access_token: token,
      scope: 'https://www.googleapis.com/auth/youtube.upload'
    })
    return oAuth2Client
  }

  async uploadVideo(
    youtubeData: {
      token: string
      filePath: string
      channelId: string
      title: string
      description: string
    },
    progressCallback?: (progress: number) => Promise<void>
  ): Promise<unknown> {
    const service = youtube('v3')
    const fileSize = statSync(youtubeData.filePath).size

    return await service.videos.insert(
      {
        auth: this.authorize(youtubeData.token),
        part: ['id', 'snippet', 'status'],
        notifySubscribers: false,
        requestBody: {
          snippet: {
            title: youtubeData.title,
            description: youtubeData.description,
            channelId: youtubeData.channelId
          },
          status: {
            privacyStatus: 'private'
          }
        },
        media: {
          body: createReadStream(youtubeData.filePath)
        }
      },
      {
        onUploadProgress: async (evt) => {
          const progress = (evt.bytesRead / fileSize) * 100
          if (progressCallback != null) {
            await progressCallback(progress)
          }
        }
      }
    )
  }
}
