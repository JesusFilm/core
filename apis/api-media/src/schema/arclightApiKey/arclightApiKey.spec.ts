import { ExecutionResult } from 'graphql'

import { ArclightApiKey } from '@core/prisma/media/client'
import { graphql } from '@core/shared/gql'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'

describe('ArclightApiKey', () => {
  const client = getClient()

  describe('arclightApiKeys', () => {
    const ARCLIGHT_API_KEYS_QUERY = graphql(`
      query ArclightApiKeys {
        arclightApiKeys {
          key
          desc
          defaultPlatform
        }
      }
    `)

    it('should query arclightApiKeys', async () => {
      const mockApiKeys: ArclightApiKey[] = [
        {
          key: 'key1',
          desc: 'Description 1',
          defaultPlatform: 'ios'
        },
        {
          key: 'key2',
          desc: 'Description 2',
          defaultPlatform: 'android'
        }
      ]
      prismaMock.arclightApiKey.findMany.mockResolvedValue(mockApiKeys)

      const response = await client({
        document: ARCLIGHT_API_KEYS_QUERY
      })
      const { data } = response as ExecutionResult<{
        arclightApiKeys: Array<{
          key: string
          desc: string | null
          defaultPlatform: 'ios' | 'android' | 'web'
        }>
      }>

      expect(prismaMock.arclightApiKey.findMany).toHaveBeenCalledWith({})
      expect(data?.arclightApiKeys).toEqual([
        {
          key: 'key1',
          desc: 'Description 1',
          defaultPlatform: 'ios'
        },
        {
          key: 'key2',
          desc: 'Description 2',
          defaultPlatform: 'android'
        }
      ])
    })
  })

  describe('arclightApiKeyByKey', () => {
    const ARCLIGHT_API_KEY_BY_KEY_QUERY = graphql(`
      query ArclightApiKeyByKey($key: String!) {
        arclightApiKeyByKey(key: $key) {
          key
          desc
          defaultPlatform
        }
      }
    `)

    it('should query arclightApiKeyByKey', async () => {
      const mockApiKey: ArclightApiKey = {
        key: 'testKey',
        desc: 'Test Description',
        defaultPlatform: 'web'
      }
      prismaMock.arclightApiKey.findUnique.mockResolvedValue(mockApiKey)

      const response = await client({
        document: ARCLIGHT_API_KEY_BY_KEY_QUERY,
        variables: { key: 'testKey' }
      })
      const { data } = response as ExecutionResult<{
        arclightApiKeyByKey: {
          key: string
          desc: string | null
          defaultPlatform: 'ios' | 'android' | 'web'
        } | null
      }>

      expect(prismaMock.arclightApiKey.findUnique).toHaveBeenCalledWith({
        where: { key: 'testKey' }
      })
      expect(data?.arclightApiKeyByKey).toEqual({
        key: 'testKey',
        desc: 'Test Description',
        defaultPlatform: 'web'
      })
    })

    it('should return null if arclightApiKeyByKey not found', async () => {
      prismaMock.arclightApiKey.findUnique.mockResolvedValue(null)

      const response = await client({
        document: ARCLIGHT_API_KEY_BY_KEY_QUERY,
        variables: { key: 'nonExistentKey' }
      })
      const { data } = response as ExecutionResult<{
        arclightApiKeyByKey: {
          key: string
          desc: string | null
          defaultPlatform: 'ios' | 'android' | 'web'
        } | null
      }>

      expect(prismaMock.arclightApiKey.findUnique).toHaveBeenCalledWith({
        where: { key: 'nonExistentKey' }
      })
      expect(data?.arclightApiKeyByKey).toBeNull()
    })
  })
})
