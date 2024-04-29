import OtaClient from '@crowdin/ota-client'
import { Injectable } from '@nestjs/common'
import map from 'lodash/map'
import mapValues from 'lodash/mapValues'
import { xliff12ToJs } from 'xliff'

import { PrismaService } from '../../lib/prisma.service'

type CrowdinFileName =
  | '/Arclight/collection_title.csv'
  | '/Arclight/collection_long_description.csv'
  | '/Arclight/media_metadata_tile.csv'
  | '/Arclight/media_metadata_description.csv'
  | '/Arclight/study_questions.csv'
  | string
// '/Arclight/Bible_books.csv',

interface CrowdinData {
  resources: {
    source: string
    target: string
    additionalAttributes: {
      resname: string
      translate?: string
    }
  }
}

@Injectable()
export class CrowdinService {
  constructor(private readonly prisma: PrismaService) {}

  async getCrowdinTranslations(): Promise<void> {
    const hash = process.env.CROWDIN_DISTRIBUTION_HASH ?? ''

    if (hash === '') throw new Error('crowdin distribution hash not set')

    const client = new OtaClient(hash, {
      disableManifestCache: true,
      disableStringsCache: true
    })

    const languages = await client.getTranslations()

    const wessLanguageMap = mapValues(languages, (language) => {
      const regex = /\/content\/(.*?)\.xliff/
      const match = language[0].file.match(regex)
      return match != null ? match[1] : ''
    })

    await Promise.all(
      map(languages, async (files, languageCode) => {
        await Promise.all(
          files.map(async ({ content }) => {
            const data: CrowdinData = await xliff12ToJs(content)
            await this.storeTranslations(wessLanguageMap[languageCode], data)
          })
        )
      })
    )
  }

  private async storeTranslations(
    wessLanguageCode: string,
    data: CrowdinData
  ): Promise<void> {
    console.log(data)
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
                wessLanguageCode,
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
    if (languageId !== '' && !isNaN(Number(languageId)))
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
          // const englishStudyQuestion =
          //   this.prisma.videoStudyQuestion.findUnique({
          //     where: { id: resName }
          //   })
          // const videoId = englishStudyQuestion?.videoId
          // if (videoId == null)
          //   throw new Error(
          //     `no matching english study question with id ${resName}`
          //   )
          // if (languageId !== '' && !isNaN(Number(languageId)))
          //   await this.prisma.videoStudyQuestion.upsert({
          //     where: {
          //       videoId_languageId: {
          //         videoId,
          //         languageId
          //       }
          //     },
          //     update: {
          //       value,
          //       order: englishStudyQuestion.order
          //     },
          //     create: {
          //       value,
          //       languageId,
          //       primary: false,
          //       videoId,
          //       order: englishStudyQuestion.order
          //     }
          //   })
          // break
        }
      }
  }
}
