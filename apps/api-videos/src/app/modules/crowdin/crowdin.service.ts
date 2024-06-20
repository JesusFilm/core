import OtaClient from '@crowdin/ota-client'
import { Injectable } from '@nestjs/common'
import map from 'lodash/map'
import { xliff12ToJs } from 'xliff'
import z from 'zod'

import { PrismaService } from '../../lib/prisma.service'

type CrowdinFileName =
  | '/Arclight/collection_title.csv'
  | '/Arclight/collection_long_description.csv'
  | '/Arclight/media_metadata_tile.csv'
  | '/Arclight/media_metadata_description.csv'
  | '/Arclight/study_questions.csv'
  | '/Arclight/Bible_books.csv'
  | string

const schema = z.object({
  resources: z.record(
    z.string(),
    z.record(
      z.string(),
      z.object({
        source: z.string(),
        target: z.string(),
        additionalAttributes: z
          .object({
            resname: z.string().optional(),
            translate: z.string().optional()
          })
          .optional()
      })
    )
  )
})

type CrowdinData = z.infer<typeof schema>

class MatchError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'MatchError'
  }
}

@Injectable()
export class CrowdinService {
  constructor(private readonly prisma: PrismaService) {}

  async pullTranslations(): Promise<void> {
    if (process.env.CROWDIN_DISTRIBUTION_HASH == null)
      throw new Error('crowdin distribution hash not set')

    const client = new OtaClient(process.env.CROWDIN_DISTRIBUTION_HASH, {
      disableManifestCache: true,
      disableStringsCache: true
    })

    const languages = await client.getTranslations()

    await Promise.all(
      map(languages, async (language) => {
        const languageId = /\/content\/(?<languageId>\d+)\.xliff/.exec(
          language[0].file
        )?.groups?.languageId

        if (languageId != null) {
          try {
            const data = schema.parse(await xliff12ToJs(language[0].content))
            await this.storeTranslations(languageId, data)
          } catch (err) {
            if (err instanceof MatchError) {
              throw new Error(err.message)
            }
            throw new Error('xliff12ToJs data does not match schema')
          }
        } else {
          throw new Error(
            `export filename does not match format or custom mapping not set: ${language[0].file}`
          )
        }
      })
    )
  }

  private async storeTranslations(
    languageId: string,
    data: CrowdinData
  ): Promise<void> {
    await Promise.all(
      map(data.resources, async (translations, fileName) => {
        await Promise.all(
          map(
            translations,
            async ({ source, target, additionalAttributes }) => {
              if (
                source.localeCompare(target) === 0 ||
                additionalAttributes?.translate === 'no' ||
                additionalAttributes?.resname == null
              )
                return
              await this.storeTranslation(
                languageId,
                target,
                additionalAttributes.resname,
                fileName
              )
            }
          )
        )
      })
    )
  }

  private async storeTranslation(
    languageId: string,
    value: string,
    resName: string,
    fileName: CrowdinFileName
  ): Promise<void> {
    switch (fileName) {
      case '/Arclight/media_metadata_tile.csv':
      case '/Arclight/collection_title.csv':
        {
          const videoId = resName
          const videos = await this.getVideos(videoId)
          if (videos.length === 0)
            throw new MatchError(`no matching videoId found for ${videoId}`)
          await this.updateVideoTitle(videos[0].id, languageId, value)
        }
        break
      case '/Arclight/collection_long_description.csv':
      case '/Arclight/media_metadata_description.csv':
        {
          const videoId = resName
          const videos = await this.getVideos(videoId)
          if (videos.length === 0)
            throw new MatchError(`no matching videoId found for ${videoId}`)
          await this.updateVideoDescription(videos[0].id, languageId, value)
        }
        break
      case '/Arclight/study_questions.csv':
        {
          const englishStudyQuestions = await this.getStudyQuestions(resName)
          if (englishStudyQuestions.length === 0)
            throw new MatchError(`no matching crowdInId found for ${resName}`)

          await Promise.all(
            map(englishStudyQuestions, async (englishStudyQuestion) => {
              const videoId = englishStudyQuestion.videoId
              if (videoId == null)
                throw new MatchError(`no matching videoId found for ${resName}`)
              await this.updateStudyQuestion(
                videoId,
                languageId,
                value,
                resName,
                englishStudyQuestion.order
              )
            })
          )
        }
        break
      case '/Arclight/Bible_books.csv':
        {
          const bibleBookId = resName
          await this.addBibleBookName(bibleBookId, languageId, value)
        }
        break
    }
  }

  private async getVideos(videoId: string): Promise<
    Array<{
      id: string
    }>
  > {
    return await this.prisma.video.findMany({
      select: { id: true },
      where: { id: { endsWith: videoId } }
    })
  }

  private async updateVideoTitle(
    videoId: string,
    languageId: string,
    value: string
  ): Promise<void> {
    await this.prisma.videoTitle.upsert({
      where: { videoId_languageId: { videoId, languageId } },
      update: { value },
      create: { value, languageId, primary: false, videoId }
    })
  }

  private async updateVideoDescription(
    videoId: string,
    languageId: string,
    value: string
  ): Promise<void> {
    await this.prisma.videoDescription.upsert({
      where: { videoId_languageId: { videoId, languageId } },
      update: { value },
      create: { value, languageId, primary: false, videoId }
    })
  }

  private async getStudyQuestions(resName: string): Promise<
    Array<{
      order: number
      videoId: string | null
    }>
  > {
    return await this.prisma.videoStudyQuestion.findMany({
      select: {
        videoId: true,
        order: true
      },
      where: { crowdInId: resName }
    })
  }

  private async updateStudyQuestion(
    videoId: string,
    languageId: string,
    value: string,
    resName: string,
    order: number
  ): Promise<void> {
    await this.prisma.videoStudyQuestion.upsert({
      where: {
        videoId_languageId_order: {
          videoId,
          languageId,
          order
        }
      },
      update: {
        value
      },
      create: {
        value,
        languageId,
        primary: false,
        videoId,
        order,
        crowdInId: resName
      }
    })
  }

  private async updateBibleBookName(
    bibleBookId: string,
    languageId: string,
    value: string
  ): Promise<void> {
    console.log(bibleBookId, languageId, value)
    await this.prisma.bibleBookName.upsert({
      where: {
        bibleBookId_languageId: {
          bibleBookId,
          languageId
        }
      },
      update: {
        value
      },
      create: {
        value,
        bibleBookId,
        languageId,
        primary: false
      }
    })
  }

  private async addBibleBookName(
    bibleBookId: string,
    languageId: string,
    value: string
  ): Promise<void> {
    console.log(bibleBookId, languageId, value)
    await this.prisma.bibleBookName.create({
      data: {
        value,
        bibleBookId,
        languageId,
        primary: false
      }
    })
  }
}
