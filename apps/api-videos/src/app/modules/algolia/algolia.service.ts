import { ApolloClient, InMemoryCache } from '@apollo/client'
import { Injectable } from '@nestjs/common'
import algoliasearch from 'algoliasearch'
import { graphql } from 'gql.tada'

import { Translation } from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'

const ENGLISH_LANGUAGE_ID = '529'
const SPANISH_LANGUAGE_ID = '21046'
const CHINESE_SIMPLIFIED_LANGUAGE_ID = '21754'

const GET_LANGUAGES = graphql(`
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
  constructor(private readonly prisma: PrismaService) {}

  async getLanguages(): Promise<LanguageRecord> {
    const apollo = new ApolloClient({
      uri: process.env.GATEWAY_URL,
      cache: new InMemoryCache()
    })

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
  }

  async syncVideosToAlgolia(): Promise<void> {
    const apiKey = process.env.ALGOLIA_API_KEY ?? ''
    const appId = process.env.ALGOLIA_APPLICATION_ID ?? ''
    const appIndex = process.env.ALGOLIA_INDEX ?? ''

    if (apiKey === '' || appId === '' || appIndex === '')
      throw new Error('algolia environment variables not set')

    console.log('getting languages from gateway')
    const languages = await this.getLanguages()

    console.log('syncing videos to algolia...')
    const client = algoliasearch(appId, apiKey)

    let offset = 0

    while (true) {
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
                    SPANISH_LANGUAGE_ID,
                    CHINESE_SIMPLIFIED_LANGUAGE_ID
                  ]
                }
              }
      })

      if (videoVariants.length === 0) {
        break
      }

      const transformedVideos = videoVariants.map((videoVariant) => {
        console.log('videoVariant', videoVariant.video?.imageAlt)
        return {
          objectID: videoVariant.id,
          videoId: videoVariant.videoId,
          titles: videoVariant.video?.title.map((title) => title.value),
          description: (
            videoVariant.video?.description as unknown as Translation[]
          ).map((description) => description?.value),
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
          imageAlt: (videoVariant.video?.imageAlt as unknown as Translation)[0]
            .value,
          childrenCount: videoVariant.video?.childIds.length
        }
      })

      const index = client.initIndex(appIndex)
      await index.saveObjects(transformedVideos).wait()

      offset += 1000
    }

    console.log('synced videos to algolia')
  }
}
