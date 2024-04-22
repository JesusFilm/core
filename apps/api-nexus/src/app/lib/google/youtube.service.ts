import { createReadStream } from 'fs'

import { youtube, youtube_v3 } from '@googleapis/youtube'
import { Injectable } from '@nestjs/common/decorators/core'
import { OAuth2Client } from 'googleapis-common'

interface ChannelsRequest {
  accessToken: string
}

interface UploadVideoRequest {
  token: string
  filePath: string
  channelId: string
  title: string
  description: string
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

  async uploadVideo({
    token,
    filePath,
    channelId,
    title,
    description
  }: UploadVideoRequest): Promise<youtube_v3.Schema$Video> {
    const client = youtube({ version: 'v3' })
    const result = await client.videos.insert({
      auth: this.authorize(token),
      part: ['id', 'snippet', 'status'],
      notifySubscribers: false,
      requestBody: {
        snippet: {
          title,
          description,
          channelId
        },
        status: {
          privacyStatus: 'private'
        }
      },
      media: {
        body: createReadStream(filePath)
      }
    })

    return result.data
  }
}
