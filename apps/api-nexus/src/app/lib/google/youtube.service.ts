import { createReadStream, statSync } from 'fs'

import { BadRequestException, Injectable } from '@nestjs/common'
import { google, youtube_v3 } from 'googleapis'
import { GaxiosPromise } from 'googleapis-common'

import { GoogleOAuthService } from './oauth.service'

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

@Injectable()
export class GoogleYoutubeService {
  private readonly rootUrl: string

  constructor(private readonly googleOAuthService: GoogleOAuthService) {
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

  async uploadVideo(
    youtubeData: {
      token: string
      filePath: string
      channelId: string
      title: string
      description: string
      defaultLanguage: string
      privacyStatus?: string
    },
    progressCallback?: (progress: number) => Promise<void>
  ): GaxiosPromise<youtube_v3.Schema$Video> {
    const service = google.youtube('v3')
    const fileSize = statSync(youtubeData.filePath).size
    try {
      return await service.videos.insert(
        {
          auth: this.googleOAuthService.authorize(
            youtubeData.token,
            'https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/youtubepartner https://www.googleapis.com/auth/youtube.force-ssl https://www.googleapis.com/auth/youtube.upload'
          ),
          part: ['id', 'snippet', 'status'],
          notifySubscribers: false,
          requestBody: {
            snippet: {
              title: youtubeData.title,
              description: youtubeData.description,
              channelId: youtubeData.channelId,
              defaultLanguage: youtubeData.defaultLanguage ?? 'en',
              categoryId: '22'
            },
            status: {
              privacyStatus: youtubeData.privacyStatus ?? 'private'
            }
          },
          media: {
            body: createReadStream(youtubeData.filePath)
          }
        },
        {
          onUploadProgress: (evt) => {
            const progress = (evt.bytesRead / fileSize) * 100
            void Promise.all([this.executeCallback(progressCallback, progress)])
          }
        }
      )
    } catch (error) {
      throw new BadRequestException(error.message)
    }
  }

  private async executeCallback(
    progressCallback: ((arg0: number) => Promise<void>) | null | undefined,
    progress: number
  ): Promise<void> {
    if (progressCallback != null) {
      await progressCallback(progress)
    }
  }

  async updateVideo(youtubeData: {
    token: string
    videoId: string
    title: string
    description: string
    defaultLanguage?: string
    privacyStatus?: string
    category: string
    isMadeForKids: boolean
    localizations: Array<{
      resourceId?: string
      title?: string
      description?: string
      tags?: string[]
      language: string
      captionDriveId?: string
    }>
  }): GaxiosPromise<youtube_v3.Schema$Video> {
    const service = google.youtube('v3')
    let uploadedYoutubeResponse
    try {
      const convertedLocalizations = {}
      youtubeData.localizations?.forEach((item) => {
        convertedLocalizations[item.language] = {
          title: item.title,
          description: item.description
        }
      })
      uploadedYoutubeResponse = await service.videos.update({
        auth: this.googleOAuthService.authorize(
          youtubeData.token,
          'https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/youtubepartner https://www.googleapis.com/auth/youtube.force-ssl'
        ),
        part: ['snippet', 'localizations', 'status'],
        requestBody: {
          id: youtubeData.videoId,
          snippet: {
            title: youtubeData.title,
            description: youtubeData.description,
            categoryId: youtubeData.category,
            defaultLanguage: youtubeData.defaultLanguage
          },
          status: {
            madeForKids: youtubeData.isMadeForKids,
            privacyStatus: youtubeData.privacyStatus
          },
          localizations: convertedLocalizations
        }
      })
    } catch (error) {
      throw new BadRequestException(error.message)
    }

    return uploadedYoutubeResponse
  }

  async updateVideoThumbnail(youtubeData: {
    token: string
    videoId: string
    thumbnailPath: string
    mimeType: string
  }): Promise<unknown> {
    const service = google.youtube('v3')

    return await service.thumbnails.set({
      auth: this.googleOAuthService.authorize(
        youtubeData.token,
        'https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/youtubepartner https://www.googleapis.com/auth/youtube.force-ssl https://www.googleapis.com/auth/youtube.upload'
      ),
      videoId: youtubeData.videoId,
      media: {
        mimeType: youtubeData.mimeType,
        body: createReadStream(youtubeData.thumbnailPath)
      }
    })
  }

  async uploadCaption(youtubeData: {
    token: string
    videoId: string
    language: string
    name: string
    captionFile: string
    isDraft: boolean
    mimeType: string
  }): Promise<unknown> {
    const service = google.youtube('v3')
    const auth = this.googleOAuthService.authorize(
      youtubeData.token,
      'https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/youtubepartner https://www.googleapis.com/auth/youtube.force-ssl https://www.googleapis.com/auth/youtube.upload'
    )

    const captionData = {
      auth,
      part: ['snippet'],
      requestBody: {
        snippet: {
          videoId: youtubeData.videoId,
          language: youtubeData.language,
          name: youtubeData.name,
          isDraft: youtubeData.isDraft
        }
      },
      media: {
        mimeType: youtubeData.mimeType,
        body: createReadStream(youtubeData.captionFile)
      }
    }

    return await service.captions.insert(captionData)
  }
}
