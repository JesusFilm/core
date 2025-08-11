import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { Tool, tool } from 'ai'
import { SearchClient, algoliasearch } from 'algoliasearch'
import { z } from 'zod'

import { ToolOptions } from '../..'

interface AlgoliaVideoHit {
  videoId: string
  titles: string[]
  description: string[]
  duration: number
  languageId: string
  languageEnglishName: string
  languagePrimaryName: string
  subtitles: string[]
  slug: string
  label: string
  image: string
  imageAlt: string
  childrenCount: number
  objectID: string
}

interface AlgoliaSearchResponse<T> {
  hits: T[]
}

async function initAlgoliaClient(): Promise<SearchClient> {
  const appID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID

  // NOTE: For local development use the new api key instead of the default doppler key
  // Lookup the key value in algolia with description: "Dev key for video-variant-stg - AI tools and Docker testing with open referer policy"
  // Update NEXT_PUBLIC_ALGOLIA_API_KEY in .env to the new key value
  const apiKey = process.env.NEXT_PUBLIC_ALGOLIA_API_KEY

  if (!appID || !apiKey) {
    throw new Error('Algolia environment variables are not set')
  }

  return algoliasearch(appID, apiKey)
}

async function searchVideosAlgolia(
  term: string,
  client: SearchClient,
  limit: number = 20
): Promise<AlgoliaVideoHit[]> {
  const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX
  if (!indexName) {
    throw new Error('Algolia videos index environment variable is not set')
  }

  const response = (await client.searchSingleIndex<AlgoliaVideoHit>({
    indexName,
    searchParams: {
      query: term,
      hitsPerPage: limit
    }
  })) as AlgoliaSearchResponse<AlgoliaVideoHit>

  if (!response.hits) {
    return []
  }

  return response.hits
}

function transformVideoHits(hits: AlgoliaVideoHit[]) {
  return hits.map((hit) => ({
    videoId: hit.videoId,
    title: hit.titles[0] || 'Untitled',
    description: hit.description[0] || '',
    duration: hit.duration,
    language: {
      id: hit.languageId,
      englishName: hit.languageEnglishName,
      primaryName: hit.languagePrimaryName
    },
    slug: hit.slug,
    label: hit.label,
    image: hit.image,
    imageAlt: hit.imageAlt,
    childrenCount: hit.childrenCount,
    subtitles: hit.subtitles
  }))
}

export function agentInternalVideoSearch(
  _client: ApolloClient<NormalizedCacheObject>,
  _options: ToolOptions
): Tool {
  return tool({
    description:
      'Search for internal videos using Algolia. Returns video metadata with videoId for card block references.',
    parameters: z.object({
      searchTerm: z.string().describe('The search term to find internal videos. Can be a title, description, or any text to search for.'),
      limit: z
        .number()
        .optional()
        .default(20)
        .describe('Maximum number of results to return (default: 20)')
    }),
          execute: async ({ searchTerm, limit = 20 }) => {
      try {
        const normalizedLimit =
          typeof limit === 'number' && Number.isFinite(limit)
            ? Math.floor(limit)
            : 20
        const validatedLimit = Math.max(normalizedLimit, 1)
        const client = await initAlgoliaClient()
        const hits = await searchVideosAlgolia(
          searchTerm,
          client,
          validatedLimit
        )
        const results = transformVideoHits(hits)

        return {
          success: true,
          count: results.length,
          searchTerm,
          results
        }
      } catch (error) {
        console.log('Error searching internal videos:', error)
        return {
          success: false,
          error:
            error instanceof Error ? error.message : 'Unknown error occurred',
          searchTerm
        }
      }
    }
  })
}
