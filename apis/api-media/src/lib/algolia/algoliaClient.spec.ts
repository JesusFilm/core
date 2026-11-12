import { vi } from 'vitest'

import { getAlgoliaClient, getAlgoliaConfig } from './algoliaClient'

const ALGOLIA_ENV_VARS = [
  'ALGOLIA_APPLICATION_ID',
  'ALGOLIA_API_KEY',
  'ALGOLIA_INDEX_VIDEOS',
  'ALGOLIA_INDEX_VIDEO_VARIANTS',
  'ALGOLIA_INDEX_LANGUAGES'
] as const

const originalEnv = process.env

describe('algoliaClient', () => {
  beforeEach(() => {
    process.env = { ...originalEnv }
    for (const name of ALGOLIA_ENV_VARS) {
      process.env[name] = `value-for-${name}`
    }
  })

  afterEach(() => {
    process.env = originalEnv
    vi.restoreAllMocks()
  })

  describe('getAlgoliaConfig', () => {
    it('should return the configured values', () => {
      const config = getAlgoliaConfig()

      expect(config.appId).toBe('value-for-ALGOLIA_APPLICATION_ID')
      expect(config.apiKey).toBe('value-for-ALGOLIA_API_KEY')
      expect(config.videosIndex).toBe('value-for-ALGOLIA_INDEX_VIDEOS')
      expect(config.videoVariantsIndex).toBe(
        'value-for-ALGOLIA_INDEX_VIDEO_VARIANTS'
      )
      expect(config.languagesIndex).toBe('value-for-ALGOLIA_INDEX_LANGUAGES')
    })

    it.each(ALGOLIA_ENV_VARS)('should throw when %s is unset', (name) => {
      delete process.env[name]

      expect(() => {
        const config = getAlgoliaConfig()
        // index names resolve lazily, so read every value to force evaluation
        return `${config.appId}${config.apiKey}${config.videosIndex}${config.videoVariantsIndex}${config.languagesIndex}`
      }).toThrow(`Missing required environment variable: ${name}`)
    })

    it.each(ALGOLIA_ENV_VARS)('should throw when %s is empty', (name) => {
      process.env[name] = ''

      expect(() => {
        const config = getAlgoliaConfig()
        return `${config.appId}${config.apiKey}${config.videosIndex}${config.videoVariantsIndex}${config.languagesIndex}`
      }).toThrow(`Missing required environment variable: ${name}`)
    })

    it.each(ALGOLIA_ENV_VARS)(
      'should throw when %s is whitespace-only',
      (name) => {
        process.env[name] = '   '

        expect(() => {
          const config = getAlgoliaConfig()
          return `${config.appId}${config.apiKey}${config.videosIndex}${config.videoVariantsIndex}${config.languagesIndex}`
        }).toThrow(`Missing required environment variable: ${name}`)
      }
    )
  })

  describe('getAlgoliaClient', () => {
    it.each(['', '   ', '\n\t'])(
      'should throw rather than build a client from a blank credential (%j)',
      (blank) => {
        process.env.ALGOLIA_API_KEY = blank

        expect(() => getAlgoliaClient()).toThrow(
          'Missing required environment variable: ALGOLIA_API_KEY'
        )
      }
    )
  })
})
