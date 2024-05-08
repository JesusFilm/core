import OtaClient from '@crowdin/ota-client'
import { Injectable } from '@nestjs/common'
import map from 'lodash/map'
import { xliff12ToJs } from 'xliff'
import z from 'zod'

import { PrismaService } from '../../lib/prisma.service'

// TODO: uncomment bible books when there is support for bible citations

type CrowdinFileName =
  | '/Arclight/collection_title.csv'
  | '/Arclight/collection_long_description.csv'
  | '/Arclight/media_metadata_tile.csv'
  | '/Arclight/media_metadata_description.csv'
  | '/Arclight/study_questions.csv'
  // | '/Arclight/Bible_books.csv'
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
          } catch {
            throw new Error(
              `xliff12ToJs data does not match schema on language: ${languageId}`
            )
          }
        } else {
          throw new Error(
            'export filename does not match format [languageId].xliff'
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
          const videos = await this.prisma.video.findMany({
            select: { id: true },
            where: {
              id: { endsWith: videoId }
            }
          })
          if (videos.length !== 1)
            throw new Error(`no matching videoId found for ${videoId}`)
          await this.prisma.videoTitle.upsert({
            where: {
              videoId_languageId: {
                videoId: videos[0].id,
                languageId
              }
            },
            update: {
              value
            },
            create: {
              value,
              languageId,
              primary: false,
              videoId: videos[0].id
            }
          })
        }
        break
      case '/Arclight/collection_long_description.csv':
      case '/Arclight/media_metadata_description.csv':
        {
          const videoId = resName
          const videos = await this.prisma.video.findMany({
            select: { id: true },
            where: {
              id: { endsWith: videoId }
            }
          })
          if (videos.length !== 1)
            throw new Error(`no matching videoId found for ${videoId}`)
          await this.prisma.videoDescription.upsert({
            where: {
              videoId_languageId: {
                videoId: videos[0].id,
                languageId
              }
            },
            update: {
              value
            },
            create: {
              value,
              languageId,
              primary: false,
              videoId: videos[0].id
            }
          })
        }
        break
      case '/Arclight/study_questions.csv': {
        const englishStudyQuestions =
          await this.prisma.videoStudyQuestion.findMany({
            select: {
              videoId: true,
              order: true
            },
            where: { crowdInId: resName }
          })

        if (englishStudyQuestions.length === 0)
          throw new Error(`no matching crowdInId found for ${resName}`)

        await Promise.all(
          map(englishStudyQuestions, async (englishStudyQuestion) => {
            const videoId = englishStudyQuestion.videoId
            if (videoId === null)
              throw new Error(`no matching videoId found for ${resName}`)
            await this.prisma.videoStudyQuestion.upsert({
              where: {
                videoId_languageId_order: {
                  videoId,
                  languageId,
                  order: englishStudyQuestion.order
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
                order: englishStudyQuestion.order,
                crowdInId: resName
              }
            })
          })
        )
        break
      }
    }
  }
}
