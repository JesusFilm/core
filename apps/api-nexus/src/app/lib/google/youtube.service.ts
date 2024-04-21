import { createReadStream, statSync } from 'fs'

import { youtube, youtube_v3 } from '@googleapis/youtube'
import { Injectable } from '@nestjs/common/decorators/core'
import { OAuth2Client } from 'googleapis-common'

interface ChannelsRequest {
  accessToken: string
}

interface Credential {
  client_secret: string
  client_id: string
  redirect_uris: string[]
}

@Injectable()
export class GoogleYoutubeService {
  async getChannels({
    accessToken
  }: ChannelsRequest): Promise<youtube_v3.Schema$ChannelListResponse> {
    const client = youtube({ version: 'v3', auth: accessToken })
    const res = await client.channels.list({
      part: ['snippet'],
      mine: true
    })

    return res.data
  }

  authorize(token: string): OAuth2Client {
    const oAuth2Client = new OAuth2Client(
      process.env.CLIENT_ID ?? '',
      process.env.CLIENT_SECRET ?? '',
      'https://localhost:4200'
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
  ): Promise<youtube_v3.Schema$Video> {
    const service = youtube('v3')
    const fileSize = statSync(youtubeData.filePath).size

    const result = await service.videos.insert(
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

    return result.data
  }
}
