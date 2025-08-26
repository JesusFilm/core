import { Logger } from 'pino'
import { z } from 'zod'

import { prisma } from '@core/prisma/media/client'

import { CROWDIN_CONFIG } from '../config'
import { processFile } from '../importer'
import { ProcessedTranslation } from '../types'

// Unified schemas
const baseTranslationSchema = z.object({
  value: z.string(),
  languageId: z.string(),
  primary: z.boolean()
})

const videoTitleSchema = baseTranslationSchema.extend({
  videoId: z.string()
})

const videoDescriptionSchema = baseTranslationSchema.extend({
  videoId: z.string()
})

const studyQuestionSchema = baseTranslationSchema.extend({
  videoId: z.string(),
  order: z.number(),
  crowdInId: z.string()
})

// Simplified ID resolution
class VideoIdResolver {
  private videoCache: Map<string, string> = new Map()
  private questionCache: Map<string, { videoId: string; order: number }> =
    new Map()

  async initialize(logger?: Logger): Promise<void> {
    // Load all videos
    const videos = await prisma.video.findMany({
      select: { id: true }
    })

    videos.forEach((video) => {
      this.videoCache.set(video.id, video.id)
      // Handle partial IDs (e.g., "abc" matches "1_abc-0-0")
      const partialMatch = video.id.match(/_(.+)$/)
      if (partialMatch) {
        this.videoCache.set(partialMatch[1], video.id)
      }
    })

    // Load study questions with crowdInIds
    const questions = await prisma.videoStudyQuestion.findMany({
      select: {
        videoId: true,
        order: true,
        crowdInId: true
      },
      where: {
        crowdInId: { not: null },
        languageId: '529' // English
      }
    })

    questions.forEach((q) => {
      if (q.crowdInId) {
        this.questionCache.set(q.crowdInId, {
          videoId: q.videoId,
          order: q.order
        })
      }
    })

    logger?.info(
      `Initialized with ${videos.length} videos and ${questions.length} questions`
    )
  }

  resolveVideoId(identifier: string): string | null {
    return this.videoCache.get(identifier) || null
  }

  resolveQuestion(
    identifier: string
  ): { videoId: string; order: number } | null {
    return this.questionCache.get(identifier) || null
  }

  clear(): void {
    this.videoCache.clear()
    this.questionCache.clear()
  }
}

// Unified importer class
export class UnifiedCrowdinImporter {
  private resolver = new VideoIdResolver()
  private logger?: Logger

  constructor(logger?: Logger) {
    this.logger = logger
  }

  async importVideoTitles(): Promise<void> {
    this.logger?.info('Starting video titles import')

    await this.resolver.initialize(this.logger)

    const importPromises = [
      this.processFile(
        CROWDIN_CONFIG.files.media_metadata_tile,
        this.upsertVideoTitle.bind(this)
      ),
      this.processFile(
        CROWDIN_CONFIG.files.collection_title,
        this.upsertVideoTitle.bind(this)
      )
    ]

    await Promise.all(importPromises)
    this.logger?.info('Finished video titles import')
  }

  async importVideoDescriptions(): Promise<void> {
    this.logger?.info('Starting video descriptions import')

    await this.resolver.initialize(this.logger)

    const importPromises = [
      this.processFile(
        CROWDIN_CONFIG.files.media_metadata_description,
        this.upsertVideoDescription.bind(this)
      ),
      this.processFile(
        CROWDIN_CONFIG.files.collection_long_description,
        this.upsertVideoDescription.bind(this)
      )
    ]

    await Promise.all(importPromises)
    this.logger?.info('Finished video descriptions import')
  }

  async importStudyQuestions(): Promise<void> {
    this.logger?.info('Starting study questions import')

    await this.resolver.initialize(this.logger)

    await this.processFile(
      CROWDIN_CONFIG.files.study_questions,
      this.upsertStudyQuestion.bind(this)
    )

    this.logger?.info('Finished study questions import')
  }

  private async processFile(
    fileConfig: any,
    processor: (data: ProcessedTranslation) => Promise<void>
  ): Promise<void> {
    await processFile(fileConfig, processor, this.logger)
  }

  private async upsertVideoTitle(data: ProcessedTranslation): Promise<void> {
    const videoId = this.resolver.resolveVideoId(data.identifier)
    if (!videoId) {
      this.logger?.debug(
        `Skipping video title - Invalid ID: ${data.identifier}`
      )
      return
    }

    const result = videoTitleSchema.parse({
      videoId,
      value: data.text,
      languageId: data.languageId,
      primary: false
    })

    await this.upsertRecord('videoTitle', result)
  }

  private async upsertVideoDescription(
    data: ProcessedTranslation
  ): Promise<void> {
    const videoId = this.resolver.resolveVideoId(data.identifier)
    if (!videoId) {
      this.logger?.debug(
        `Skipping video description - Invalid ID: ${data.identifier}`
      )
      return
    }

    const result = videoDescriptionSchema.parse({
      videoId,
      value: data.text,
      languageId: data.languageId,
      primary: false
    })

    await this.upsertRecord('videoDescription', result)
  }

  private async upsertStudyQuestion(data: ProcessedTranslation): Promise<void> {
    const questionId = this.extractQuestionId(data.context)
    if (!questionId) {
      this.logger?.debug(
        `Skipping study question - Invalid context: ${data.context}`
      )
      return
    }

    const questionData = this.resolver.resolveQuestion(questionId)
    if (!questionData) {
      this.logger?.debug(`Skipping study question - Not found: ${questionId}`)
      return
    }

    const result = studyQuestionSchema.parse({
      videoId: questionData.videoId,
      order: questionData.order,
      crowdInId: questionId,
      value: data.text,
      languageId: data.languageId,
      primary: data.languageId === '529'
    })

    await this.upsertRecord('videoStudyQuestion', result)
  }

  private extractQuestionId(context: string): string | null {
    if (!context) return null
    return context.split('\n')[0] || null
  }

  private async upsertRecord(
    type: 'videoTitle' | 'videoDescription' | 'videoStudyQuestion',
    data: any
  ): Promise<void> {
    try {
      switch (type) {
        case 'videoTitle':
          await prisma.videoTitle.upsert({
            where: {
              videoId_languageId: {
                videoId: data.videoId,
                languageId: data.languageId
              }
            },
            update: data,
            create: data
          })
          break

        case 'videoDescription':
          await prisma.videoDescription.upsert({
            where: {
              videoId_languageId: {
                videoId: data.videoId,
                languageId: data.languageId
              }
            },
            update: data,
            create: data
          })
          break

        case 'videoStudyQuestion':
          await prisma.videoStudyQuestion.upsert({
            where: {
              videoId_languageId_order: {
                videoId: data.videoId,
                languageId: data.languageId,
                order: data.order
              }
            },
            update: data,
            create: data
          })
          break
      }
    } catch (error) {
      this.logger?.error(`Failed to upsert ${type}:`, error)
      throw error
    }
  }

  cleanup(): void {
    this.resolver.clear()
  }
}

// Convenience functions for backward compatibility
export async function importVideoTitles(logger?: Logger): Promise<() => void> {
  const importer = new UnifiedCrowdinImporter(logger)
  await importer.importVideoTitles()
  return () => importer.cleanup()
}

export async function importVideoDescriptions(
  logger?: Logger
): Promise<() => void> {
  const importer = new UnifiedCrowdinImporter(logger)
  await importer.importVideoDescriptions()
  return () => importer.cleanup()
}

export async function importStudyQuestions(
  logger?: Logger
): Promise<() => void> {
  const importer = new UnifiedCrowdinImporter(logger)
  await importer.importStudyQuestions()
  return () => importer.cleanup()
}
