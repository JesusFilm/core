import { ApolloClient, InMemoryCache } from '@apollo/client'
import { Injectable, Logger } from '@nestjs/common'
import algoliasearch from 'algoliasearch'
import { graphql } from 'gql.tada'

import { PrismaService } from '../../lib/prisma.service'

const ENGLISH_LANGUAGE_ID = '529'
const SPANISH_CASTILIAN_LANGUAGE_ID = '21046'
const SPANISH_LATIN_AMERICAN_LANGUAGE_ID = '21028'
const CHINESE_TRADITIONAL_LANGUAGE_ID = '21753'
const CHINESE_SIMPLIFIED_LANGUAGE_ID = '21754'
const CHINESE_MANDARIN_LANGUAGE_ID = '20615'
const CHINESE_CANTONESE_LANGUAGE_ID = '20601'

export const apollo = new ApolloClient({
  uri: process.env.GATEWAY_URL,
  cache: new InMemoryCache()
})

export const GET_LANGUAGES = graphql(`
  query getLanguages {
    languages {
      id
      name(languageId: "529", primary: true) {
        value
        primary
        language {
          id
        }
      }
    }
  }
`)

interface LanguageRecord {
  [key: string]: {
    english: string | undefined
    primary: string | undefined
  }
}

@Injectable()
export class AlgoliaService {
  private readonly logger = new Logger(AlgoliaService.name)
  constructor(private readonly prisma: PrismaService) {}

  async getLanguages(): Promise<LanguageRecord> {
    try {
      const { data } = await apollo.query({
        query: GET_LANGUAGES
      })

      const languagesRecord: LanguageRecord = {}
      data.languages.forEach((language) => {
        languagesRecord[language.id] = {
          english: language.name.find(({ language }) => language.id === '529')
            ?.value,
          primary: language.name.find(({ primary }) => primary)?.value
        }
      })

      return languagesRecord
    } catch (error) {
      this.logger.error('Error fetching languages:', error)
      return {}
    }
  }

  async syncVideosToAlgolia(): Promise<void> {
    const apiKey = process.env.ALGOLIA_API_KEY ?? ''
    const appId = process.env.ALGOLIA_APPLICATION_ID ?? ''
    const appIndex = process.env.ALGOLIA_INDEX ?? ''

    if (apiKey === '' || appId === '' || appIndex === '')
      throw new Error('algolia environment variables not set')

    this.logger.log('getting languages from gateway')
    const languages = await this.getLanguages()

    this.logger.log('syncing videos to algolia...')
    const client = algoliasearch(appId, apiKey)

    let offset = 0

    while (true) {
      try {
        const videoVariants = await this.prisma.videoVariant.findMany({
          take: 1000,
          skip: offset,
          include: {
            video: {
              include: {
                title: true,
                description: true,
                imageAlt: true,
                snippet: true
              }
            },
            subtitle: true
          },
          where:
            appIndex === 'video-variants-prd'
              ? undefined
              : {
                  languageId: {
                    in: [
                      ENGLISH_LANGUAGE_ID,
                      SPANISH_CASTILIAN_LANGUAGE_ID,
                      SPANISH_LATIN_AMERICAN_LANGUAGE_ID,
                      CHINESE_TRADITIONAL_LANGUAGE_ID,
                      CHINESE_SIMPLIFIED_LANGUAGE_ID,
                      CHINESE_MANDARIN_LANGUAGE_ID,
                      CHINESE_CANTONESE_LANGUAGE_ID
                    ]
                  }
                }
        })

        if (videoVariants.length === 0) {
          break
        }

        const transformedVideos = videoVariants.map((videoVariant) => {
          return {
            objectID: videoVariant.id,
            videoId: videoVariant.videoId,
            titles: videoVariant.video?.title.map((title) => title.value),
            description: videoVariant.video?.description?.map(
              (description) => description?.value
            ),
            duration: videoVariant.duration,
            languageId: videoVariant.languageId,
            languageEnglishName: languages[videoVariant.languageId]?.english,
            languagePrimaryName: languages[videoVariant.languageId]?.primary,
            subtitles: videoVariant.subtitle.map(
              (subtitle) => subtitle.languageId
            ),
            slug: videoVariant.slug,
            label: videoVariant.video?.label,
            image: videoVariant.video?.image,
            imageAlt: videoVariant.video?.imageAlt.find(
              (alt) => alt.languageId === '529'
            )?.value,
            childrenCount: videoVariant.video?.childIds.length
          }
        })

        const index = client.initIndex(appIndex)
        try {
          await index.saveObjects(transformedVideos).wait()
        } catch (error) {
          console.error('Error syncing videos to algolia:', error)
        }

        offset += 1000
        this.logger.log(`synced ${offset} videos to algolia`)
      } catch (error) {
        console.error('Error in video processing loop:', error)
        break
      }
    }

    console.log('synced videos to algolia')
  }
}
