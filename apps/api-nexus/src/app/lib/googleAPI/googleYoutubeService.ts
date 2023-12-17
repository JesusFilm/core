import { Injectable } from '@nestjs/common/decorators/core'

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
  grant_type: 'authorization_code' | 'refresh_token'
}

@Injectable()
export class GoogleYoutubeService {
  rootUrl: string
  constructor() {
    this.rootUrl = 'https://www.googleapis.com/youtube/v3/channels'
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
}