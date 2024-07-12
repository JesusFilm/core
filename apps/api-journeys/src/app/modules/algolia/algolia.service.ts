import { Injectable } from '@nestjs/common'
import algoliasearch from 'algoliasearch'

import { ApolloClient, InMemoryCache, gql } from '@apollo/client'
import { GetLanguageQuery, GetTagsQuery } from '../../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'
import { Prisma } from '.prisma/api-journeys-client'

export const GET_TAGS = gql`
  query GetTags {
    tags {
      id
      parentId
      name {
        value
        primary
      }
    }
  }
`

export const GET_LANGUAGE = gql`
  query GetLanguage($languageId: ID) {
    languages(limit: 5000) {
      id
      name(languageId: $languageId, primary: true) {
        value
        primary
      }
    }
  }
`

type JourneyTags = Prisma.JourneyGetPayload<{
  include: {
    journeyTags: true
  }
}>

@Injectable()
export class AlgoliaService {
  constructor(private readonly prismaService: PrismaService) {}

  async getTags(): Promise<GetTagsQuery> {
    const apollo = new ApolloClient({
      uri: process.env.GATEWAY_URL,
      cache: new InMemoryCache()
    })
    const { data } = await apollo.query<GetTagsQuery>({
      query: GET_TAGS
    })
    return data
  }

  processTags(tagsData: GetTagsQuery, journeyTags: JourneyTags['journeyTags']) {
    const tagsMap: Record<string, string> = {}
    const parentToChildrenMap: Record<string, string[]> = {}

    tagsData.tags.forEach((tag) => {
      tagsMap[tag.id] = tag.name.find((name) => name.primary)?.value ?? ''
    })

    const filteredTags = tagsData.tags.filter((tag) =>
      journeyTags.find((journeyTag) => journeyTag.tagId === tag.id)
    )

    filteredTags.forEach((tag) => {
      const childName = tagsMap[tag.id]
      const parentName = tag.parentId != null ? tagsMap[tag.parentId] : ''
      if (childName !== '' && parentName !== '') {
        if (!parentToChildrenMap[parentName]) {
          parentToChildrenMap[parentName] = []
        }
        parentToChildrenMap[parentName].push(childName)
      }
    })

    return parentToChildrenMap
  }

  async getLanguages() {
    const apollo = new ApolloClient({
      uri: process.env.GATEWAY_URL,
      cache: new InMemoryCache()
    })
    const { data } = await apollo.query<GetLanguageQuery>({
      query: GET_LANGUAGE
    })
    return data
  }

  processLanguages(languagesData: GetLanguageQuery) {
    const map: Record<string, string> = {}
    languagesData.languages.forEach((language) => {
      map[language.id] = language.name.find((name) => name.primary)?.value ?? ''
    })
    return map
  }

  async syncJourneysToAlgolia(): Promise<void> {
    const apiKey = process.env.ALGOLIA_API_KEY ?? ''
    const appId = process.env.ALGOLIA_APPLICATION_ID ?? ''
    const dopplerEnv = process.env.DOPPLER_ENVIRONMENT ?? ''

    if (apiKey === '' || appId === '' || dopplerEnv === '')
      throw new Error('algolia environment variables not set')

    console.log('getting tags from gateway...')
    const tagsData = await this.getTags()

    console.log('getting languages from gateway...')
    const languagesData = await this.getLanguages()
    const languagesMap = this.processLanguages(languagesData)

    console.log('syncing journeys to algolia...')
    const client = algoliasearch(appId, apiKey)

    let offset = 0

    while (true) {
      const journeys = await this.prismaService.journey.findMany({
        take: 50,
        skip: offset,
        include: {
          primaryImageBlock: true,
          journeyTags: true
        },
        where: {
          template: true
        }
      })

      if (journeys.length === 0) break

      const transformedJourneys = journeys.map((journey) => {
        const tags = this.processTags(tagsData, journey.journeyTags)
        return {
          objectID: journey.id,
          title: journey.title,
          date: journey.createdAt,
          description: journey.description,
          image: {
            src: journey.primaryImageBlock?.src,
            alt: journey.primaryImageBlock?.alt
          },
          featuredAt: journey.featuredAt,
          language: languagesMap[journey.languageId],
          tags
        }
      })

      const index = client.initIndex(`api-journeys-journeys-${dopplerEnv}`)

      try {
        await index.saveObjects(transformedJourneys).wait()
      } catch (e) {
        console.error(e)
      }

      offset += 50
    }

    console.log('synced journeys to algolia')
  }
}
