import { Redis } from '@upstash/redis'
import type { NextApiRequest, NextApiResponse } from 'next'

import { graphql } from '@core/shared/gql'

import { createApolloClient } from '../../src/libs/apolloClient'
import type { LanguageMapPoint } from '../../src/libs/useLanguageMap/types'

const GET_LANGUAGE_MAP = graphql(`
  query GetLanguageMap($limit: Int) {
    languages(limit: $limit) {
      id
      slug
      englishName: name(languageId: "529") {
        value
      }
      nativeName: name(primary: true) {
        value
      }
      countryLanguages {
        country {
          id
          latitude
          longitude
          name(primary: true) {
            value
          }
        }
      }
    }
  }
`)

type ApiResponse = LanguageMapPoint[] | { error: string }

const CACHE_TTL = 86400 // 1 day in seconds
const LANGUAGE_MAP_CACHE_SCHEMA_VERSION = `2025-02-10`
const LANGUAGE_MAP_CACHE_KEY = `language-map:${LANGUAGE_MAP_CACHE_SCHEMA_VERSION}`

let redisInstance: Redis | undefined
function getRedis(): Redis {
  if (redisInstance == null || process.env.NODE_ENV === 'test') {
    redisInstance = new Redis({
      url:
        process.env.REDIRECT_STORAGE_KV_REST_API_URL ??
        'http://serverless-redis-http:80',
      token: process.env.REDIRECT_STORAGE_KV_REST_API_TOKEN ?? 'example_token'
    })
  }
  return redisInstance
}

function buildLanguagePoint({
  languageId,
  slug,
  englishNames,
  nativeNames,
  countryId,
  countryName,
  latitude,
  longitude
}: {
  languageId: string
  slug: string | null
  englishNames: Array<{ value: string | null }>
  nativeNames: Array<{ value: string | null }>
  countryId: string
  countryName?: string | null
  latitude?: number | null
  longitude?: number | null
}): LanguageMapPoint | null {
  if (latitude == null || longitude == null) return null

  const englishName = englishNames.find(({ value }) => value != null)?.value ?? undefined
  const nativeName = nativeNames.find(({ value }) => value != null)?.value ?? undefined
  const languageName = englishName ?? nativeName ?? languageId

  return {
    id: `${languageId}-${countryId}`,
    languageId,
    slug: slug ?? undefined,
    languageName,
    englishName,
    nativeName,
    countryId,
    countryName: countryName ?? undefined,
    latitude,
    longitude
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
): Promise<void> {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const redis = getRedis()

  try {
    const cached = await redis.get<LanguageMapPoint[]>(LANGUAGE_MAP_CACHE_KEY)
    if (cached != null) {
      res.setHeader(
        'Cache-Control',
        `public, max-age=${CACHE_TTL}, stale-while-revalidate=${CACHE_TTL}`
      )
      res.status(200).json(cached)
      return
    }
  } catch (error) {
    console.error('Redis get error:', error)
  }

  try {
    const apolloClient = createApolloClient()
    const { data } = await apolloClient.query({
      query: GET_LANGUAGE_MAP,
      variables: { limit: 6000 }
    })

    const points = data.languages
      .flatMap((language) => {
        return language.countryLanguages
          .map(({ country }) =>
            buildLanguagePoint({
              languageId: language.id,
              slug: language.slug,
              englishNames: language.englishName,
              nativeNames: language.nativeName,
              countryId: country.id,
              countryName: country.name[0]?.value,
              latitude: country.latitude,
              longitude: country.longitude
            })
          )
          .filter((point): point is LanguageMapPoint => point != null)
      })
      .filter((point, index, all) => all.findIndex(({ id }) => id === point.id) === index)

    try {
      await redis.setex(LANGUAGE_MAP_CACHE_KEY, CACHE_TTL, points)
    } catch (error) {
      console.error('Redis setex error:', error)
    }

    res.setHeader(
      'Cache-Control',
      `public, max-age=${CACHE_TTL}, stale-while-revalidate=${CACHE_TTL}`
    )
    res.status(200).json(points)
  } catch (error) {
    console.error('Error building language map:', error)
    res.status(500).json({ error: 'Failed to fetch language map' })
  }
}
