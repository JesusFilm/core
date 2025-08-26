import { Logger } from 'pino'
import { z } from 'zod'

import { prisma } from '@core/prisma/media/client'

import { CROWDIN_CONFIG } from '../config'
import {
  crowdinClient,
  crowdinProjectId
} from '../../lib/crowdin/crowdinClient'

// Webhook event schemas
const webhookEventSchema = z.object({
  event: z.string(),
  event_type: z.string(),
  project: z.object({
    id: z.number(),
    name: z.string()
  }),
  file: z
    .object({
      id: z.number(),
      name: z.string()
    })
    .optional(),
  string: z
    .object({
      id: z.number(),
      identifier: z.string().optional(),
      text: z.string(),
      context: z.string().optional(),
      file_id: z.number()
    })
    .optional()
})

const stringUpdatedEventSchema = webhookEventSchema.extend({
  event: z.literal('string.updated'),
  string: z.object({
    id: z.number(),
    identifier: z.string().optional(),
    text: z.string(),
    context: z.string().optional(),
    file_id: z.number()
  })
})

const stringAddedEventSchema = webhookEventSchema.extend({
  event: z.literal('string.added'),
  string: z.object({
    id: z.number(),
    identifier: z.string().optional(),
    text: z.string(),
    context: z.string().optional(),
    file_id: z.number()
  })
})

type WebhookEvent = z.infer<typeof webhookEventSchema>
type StringUpdatedEvent = z.infer<typeof stringUpdatedEventSchema>
type StringAddedEvent = z.infer<typeof stringAddedEventSchema>

// File type mapping
const FILE_TYPE_MAP = {
  [CROWDIN_CONFIG.files.media_metadata_tile.id]: 'videoTitle',
  [CROWDIN_CONFIG.files.collection_title.id]: 'videoTitle',
  [CROWDIN_CONFIG.files.media_metadata_description.id]: 'videoDescription',
  [CROWDIN_CONFIG.files.collection_long_description.id]: 'videoDescription',
  [CROWDIN_CONFIG.files.study_questions.id]: 'studyQuestion'
} as const

type FileType = (typeof FILE_TYPE_MAP)[keyof typeof FILE_TYPE_MAP]

export class CrowdinWebhookHandler {
  private logger?: Logger

  constructor(logger?: Logger) {
    this.logger = logger?.child({ component: 'crowdinWebhookHandler' })
  }

  async handleWebhook(payload: unknown): Promise<void> {
    try {
      const event = webhookEventSchema.parse(payload)
      this.logger?.info('Processing webhook event', {
        event: event.event,
        eventType: event.event_type
      })

      // Verify it's for our project
      if (event.project.id !== crowdinProjectId) {
        this.logger?.warn('Webhook from different project, ignoring', {
          projectId: event.project.id
        })
        return
      }

      switch (event.event) {
        case 'string.updated':
          await this.handleStringUpdated(
            stringUpdatedEventSchema.parse(payload)
          )
          break
        case 'string.added':
          await this.handleStringAdded(stringAddedEventSchema.parse(payload))
          break
        default:
          this.logger?.debug('Unhandled webhook event', { event: event.event })
      }
    } catch (error) {
      this.logger?.error('Failed to process webhook', { error, payload })
      throw error
    }
  }

  private async handleStringUpdated(event: StringUpdatedEvent): Promise<void> {
    if (!event.string) return

    const fileType = this.getFileType(event.string.file_id)
    if (!fileType) {
      this.logger?.debug('Unknown file type, skipping', {
        fileId: event.string.file_id
      })
      return
    }

    await this.updateTranslation(fileType, event.string)
  }

  private async handleStringAdded(event: StringAddedEvent): Promise<void> {
    if (!event.string) return

    const fileType = this.getFileType(event.string.file_id)
    if (!fileType) {
      this.logger?.debug('Unknown file type, skipping', {
        fileId: event.string.file_id
      })
      return
    }

    await this.updateTranslation(fileType, event.string)
  }

  private getFileType(fileId: number): FileType | null {
    return FILE_TYPE_MAP[fileId as keyof typeof FILE_TYPE_MAP] || null
  }

  private async updateTranslation(
    fileType: FileType,
    stringData: any
  ): Promise<void> {
    try {
      switch (fileType) {
        case 'videoTitle':
          await this.updateVideoTitle(stringData)
          break
        case 'videoDescription':
          await this.updateVideoDescription(stringData)
          break
        case 'studyQuestion':
          await this.updateStudyQuestion(stringData)
          break
      }
    } catch (error) {
      this.logger?.error(`Failed to update ${fileType}`, { error, stringData })
      throw error
    }
  }

  private async updateVideoTitle(stringData: any): Promise<void> {
    if (!stringData.identifier) {
      this.logger?.warn('Video title missing identifier', {
        stringId: stringData.id
      })
      return
    }

    // Get the language ID for this string
    const languageId = await this.getLanguageId(stringData.id)
    if (!languageId) {
      this.logger?.warn('Could not determine language for string', {
        stringId: stringData.id
      })
      return
    }

    // Find the video by identifier
    const video = await this.findVideoByIdentifier(stringData.identifier)
    if (!video) {
      this.logger?.warn('Video not found for identifier', {
        identifier: stringData.identifier
      })
      return
    }

    // Update the video title
    await prisma.videoTitle.upsert({
      where: {
        videoId_languageId: {
          videoId: video.id,
          languageId: languageId
        }
      },
      update: {
        value: stringData.text,
        primary: languageId === '529'
      },
      create: {
        videoId: video.id,
        languageId: languageId,
        value: stringData.text,
        primary: languageId === '529'
      }
    })

    this.logger?.info('Updated video title', {
      videoId: video.id,
      languageId,
      stringId: stringData.id
    })
  }

  private async updateVideoDescription(stringData: any): Promise<void> {
    if (!stringData.identifier) {
      this.logger?.warn('Video description missing identifier', {
        stringId: stringData.id
      })
      return
    }

    const languageId = await this.getLanguageId(stringData.id)
    if (!languageId) {
      this.logger?.warn('Could not determine language for string', {
        stringId: stringData.id
      })
      return
    }

    const video = await this.findVideoByIdentifier(stringData.identifier)
    if (!video) {
      this.logger?.warn('Video not found for identifier', {
        identifier: stringData.identifier
      })
      return
    }

    await prisma.videoDescription.upsert({
      where: {
        videoId_languageId: {
          videoId: video.id,
          languageId: languageId
        }
      },
      update: {
        value: stringData.text,
        primary: languageId === '529'
      },
      create: {
        videoId: video.id,
        languageId: languageId,
        value: stringData.text,
        primary: languageId === '529'
      }
    })

    this.logger?.info('Updated video description', {
      videoId: video.id,
      languageId,
      stringId: stringData.id
    })
  }

  private async updateStudyQuestion(stringData: any): Promise<void> {
    if (!stringData.identifier) {
      this.logger?.warn('Study question missing identifier', {
        stringId: stringData.id
      })
      return
    }

    const languageId = await this.getLanguageId(stringData.id)
    if (!languageId) {
      this.logger?.warn('Could not determine language for string', {
        stringId: stringData.id
      })
      return
    }

    // Find the study question by crowdInId
    const studyQuestion = await prisma.videoStudyQuestion.findFirst({
      where: {
        crowdInId: stringData.identifier,
        languageId: '529' // English reference
      }
    })

    if (!studyQuestion) {
      this.logger?.warn('Study question not found for identifier', {
        identifier: stringData.identifier
      })
      return
    }

    await prisma.videoStudyQuestion.upsert({
      where: {
        videoId_languageId_order: {
          videoId: studyQuestion.videoId,
          languageId: languageId,
          order: studyQuestion.order
        }
      },
      update: {
        value: stringData.text,
        crowdInId: stringData.identifier,
        primary: languageId === '529'
      },
      create: {
        videoId: studyQuestion.videoId,
        languageId: languageId,
        order: studyQuestion.order,
        value: stringData.text,
        crowdInId: stringData.identifier,
        primary: languageId === '529'
      }
    })

    this.logger?.info('Updated study question', {
      videoId: studyQuestion.videoId,
      order: studyQuestion.order,
      languageId,
      stringId: stringData.id
    })
  }

  private async getLanguageId(stringId: number): Promise<string | null> {
    try {
      const response = await crowdinClient.sourceStringsApi.getString(
        crowdinProjectId,
        stringId
      )
      return response.data.languageId?.toString() || null
    } catch (error) {
      this.logger?.error('Failed to get language ID for string', {
        stringId,
        error
      })
      return null
    }
  }

  private async findVideoByIdentifier(
    identifier: string
  ): Promise<{ id: string } | null> {
    // First try exact match
    let video = await prisma.video.findUnique({
      where: { id: identifier },
      select: { id: true }
    })

    if (video) return video

    // Try partial match (e.g., "abc" matches "1_abc-0-0")
    const partialMatch = identifier.match(/^(.+)$/)
    if (partialMatch) {
      const videos = await prisma.video.findMany({
        where: {
          id: {
            contains: `_${partialMatch[1]}`
          }
        },
        select: { id: true }
      })

      if (videos.length === 1) {
        return videos[0]
      }
    }

    return null
  }
}

// Express middleware for webhook endpoint
export function createWebhookMiddleware(logger?: Logger) {
  const handler = new CrowdinWebhookHandler(logger)

  return async (req: any, res: any, next: any) => {
    try {
      await handler.handleWebhook(req.body)
      res.status(200).json({ success: true })
    } catch (error) {
      logger?.error('Webhook middleware error', { error })
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}
