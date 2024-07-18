import { Injectable } from '@nestjs/common'
import algoliasearch from 'algoliasearch'

import { ApolloClient, InMemoryCache, gql } from '@apollo/client'

import { GetLanguageQuery } from '../../../__generated__/graphql'
import { Translation } from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'

export const GET_LANGUAGE = gql`
  query GetLanguage($languageId: ID) {
    languages(limit: 5000) {
      id
      name {
        value
        primary
      }
      countries {
        continent(languageId: $languageId, primary: true) {
          value
          primary
        }
      }
    }
  }
`

interface TransformedLanguage {
  localName: string
  nativeName: string
  continents: string[]
}

@Injectable()
export class AlgoliaService {
  constructor(private readonly prisma: PrismaService) {}

  async getLanguages() {
    const apollo = new ApolloClient({
      uri: process.env.GATEWAY_URL ?? '',
      cache: new InMemoryCache()
    })
    const { data } = await apollo.query<GetLanguageQuery>({
      query: GET_LANGUAGE,
      variables: {
        languageId: '529'
      }
    })
    return data
  }

  processLanguages(
    languagesData: GetLanguageQuery
  ): Record<string, TransformedLanguage> {
    const map: Record<string, TransformedLanguage> = {}

    languagesData.languages.forEach(({ id, name, countries }) => {
      let localName = ''
      let nativeName = ''
      const continentsSet = new Set<string>()

      name.forEach(({ primary, value }) => {
        if (primary) nativeName = value
        else if (!localName) localName = value
        if (localName && nativeName) return
      })

      countries.forEach((country) => {
        country.continent.forEach(({ primary, value }) => {
          if (primary && value) {
            continentsSet.add(value)
            return
          }
        })
      })

      const continents = Array.from(continentsSet).filter(Boolean)

      map[id] = { localName, nativeName, continents }
    })

    return map
  }

  async syncVideosToAlgolia(): Promise<void> {
    const apiKey = process.env.ALGOLIA_API_KEY ?? ''
    const appId = process.env.ALGOLIA_APPLICATION_ID ?? ''
    const appIndex = process.env.ALGOLIA_INDEX ?? ''

    if (apiKey === '' || appId === '' || appIndex === '')
      throw new Error('algolia environment variables not set')

    console.log('getting languages from gateway...')
    const languagesData = await this.getLanguages()
    const languagesMap = this.processLanguages(languagesData)

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
                languageId: '529'
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
          ).map((description) => description?.value ?? ''),
          duration: videoVariant.duration,
          language: languagesMap[videoVariant.languageId],
          subtitles: videoVariant.subtitle.map(
            (subtitle) => subtitle.languageId
          ),
          slug: videoVariant.slug,
          label: videoVariant.video?.label,
          image: videoVariant.video?.image,
          imageAlt: videoVariant.video?.imageAlt.map(
            (imageAlt) => imageAlt.value
          )[0],
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
