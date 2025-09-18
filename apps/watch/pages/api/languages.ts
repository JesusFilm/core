import { Redis } from '@upstash/redis'
import { NextApiRequest, NextApiResponse } from 'next'

import { graphql } from '@core/shared/gql'

import { createApolloClient } from '../../src/libs/apolloClient'

const GET_ALL_LANGUAGES = graphql(`
  query GetAllLanguages {
    languages {
      id
      slug
      nativeName: name(primary: true) {
        value
      }
      name(primary: false) {
        value
        language {
          id
        }
      }
    }
  }
`)

type LanguageTuple = [languageIdSlugNativeName: string, ...string[]]

type ApiResponse =
  | LanguageTuple[]
  | {
      error: string
    }

let _redis: Redis | undefined
let redisUnavailable = false
let redisErrorLogged = false

function redisClient(): Redis {
  if (_redis == null || process.env.NODE_ENV === 'test') {
    _redis = new Redis({
      url:
        process.env.REDIRECT_STORAGE_KV_REST_API_URL ??
        'http://serverless-redis-http:80',
      token: process.env.REDIRECT_STORAGE_KV_REST_API_TOKEN ?? 'example_token'
    })
    redisUnavailable = false
  }
  return _redis
}

const CACHE_TTL = 86400 // 1 day in seconds
export const LANGUAGES_CACHE_SCHEMA_VERSION = `2025-08-29`

interface MemoryCacheEntry {
  value: LanguageTuple[]
  expiresAt: number
}

const inMemoryCache = new Map<string, MemoryCacheEntry>()

function readFromMemoryCache(key: string): LanguageTuple[] | null {
  const cached = inMemoryCache.get(key)
  if (cached == null) return null
  if (cached.expiresAt <= Date.now()) {
    inMemoryCache.delete(key)
    return null
  }
  return cached.value
}

function writeToMemoryCache(key: string, value: LanguageTuple[]): void {
  inMemoryCache.set(key, {
    value,
    expiresAt: Date.now() + CACHE_TTL * 1000
  })
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

  const redis = redisUnavailable ? undefined : redisClient()
  // User's preferred language doesn't match the current path
  // Check if we have cached variant languages for this video
  const cacheKey = `languages:${LANGUAGES_CACHE_SCHEMA_VERSION}`

  let cachedLanguages: LanguageTuple[] | null = null

  if (redis != null) {
    try {
      cachedLanguages = await redis.get(cacheKey)
    } catch (error) {
      redisUnavailable = true
      if (!redisErrorLogged) {
        redisErrorLogged = true
        console.error('Redis get error:', error)
      }
    }
  }

  if (cachedLanguages == null) {
    cachedLanguages = readFromMemoryCache(cacheKey)
  }

  if (cachedLanguages) {
    res.setHeader(
      'Cache-Control',
      `public, max-age=${CACHE_TTL}, stale-while-revalidate=${CACHE_TTL}`
    )
    res.status(200).json(cachedLanguages)
  } else {
    try {
      const apolloClient = createApolloClient()
      const { data } = await apolloClient.query({
        query: GET_ALL_LANGUAGES
      })

      const languages: LanguageTuple[] = data.languages
        .map((language) => {
          const nativeName = language.nativeName[0]?.value
          const name = language.name
            .filter((name) => name.value !== '')
            .map((name) => `${name.language.id}:${name.value}`)
          if (name.length === 0 && nativeName == null) return

          const languageIdAndSlug = `${language.id}:${language.slug ?? ''}${
            nativeName ? `:${nativeName}` : ''
          }`

          return [languageIdAndSlug, ...name] as LanguageTuple
        })
        .filter((language): language is LanguageTuple => language != null)
      if (redisUnavailable === false && redis != null) {
        try {
          await redis.setex(cacheKey, CACHE_TTL, languages)
        } catch (error) {
          redisUnavailable = true
          if (!redisErrorLogged) {
            redisErrorLogged = true
            console.error('Redis setex error:', error)
          }
        }
      }

      if (redisUnavailable) {
        writeToMemoryCache(cacheKey, languages)
      }

      res.setHeader(
        'Cache-Control',
        `public, max-age=${CACHE_TTL}, stale-while-revalidate=${CACHE_TTL}`
      )
      res.status(200).json(languages)
    } catch (error) {
      console.error('Error fetching languages:', error)
      res.status(500).json({
        error: 'Failed to fetch languages'
      })
    }
  }
}
