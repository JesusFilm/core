import { ApolloClient, InMemoryCache, gql } from '@apollo/client'
import { Injectable } from '@nestjs/common'
import algoliasearch from 'algoliasearch'

import { GetLanguagesQuery } from '../../../__generated__/graphql'
import { Translation } from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'

const GET_LANGUAGES = gql`
  query getLanguages {
    languages {
      id
      name {
        value
        language {
          id
        }
      }
    }
  }
`

@Injectable()
export class AlgoliaService {
  constructor(private readonly prisma: PrismaService) {}

  async getLanguages(): Promise<Record<string, string | undefined>> {
    const apollo = new ApolloClient({
      uri: process.env.GATEWAY_URL,
      cache: new InMemoryCache()
    })

    const { data } = await apollo.query<GetLanguagesQuery>({
      query: GET_LANGUAGES
    })

    const languagesRecord: Record<string, string | undefined> = {}
    data.languages.forEach((language) => {
      languagesRecord[language.id] = language.name.find(
        ({ language }) => language.id === '529'
      )?.value
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
                AND: {
                  OR: [
                    {
                      languageId: '529' // English
                    },
                    {
                      languageId: '21046' // Spanish
                    },
                    {
                      languageId: '21754' // Chinese Simplified
                    }
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
          description: (
            videoVariant.video?.description as unknown as Translation[]
          ).map((description) => description?.value),
          duration: videoVariant.duration,
          languageId: videoVariant.languageId,
          languageName: languages[videoVariant.languageId],
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
