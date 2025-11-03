import { graphql } from '@core/shared/gql'

import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'

describe('agent apiKey queries', () => {
  const authClient = getClient({
    headers: {
      authorization: 'token'
    }
  })

  const API_KEYS_QUERY = graphql(`
    query LuminaAgentApiKeys($agentId: ID!) {
      luminaAgentApiKeys(agentId: $agentId) {
        id
        agentId
        name
        key
        enabled
        createdAt
        updatedAt
        lastUsedAt
      }
    }
  `)

  const API_KEY_QUERY = graphql(`
    query LuminaAgentApiKey($id: ID!) {
      luminaAgentApiKey(id: $id) {
        ... on QueryLuminaAgentApiKeySuccess {
          data {
            id
            agentId
            name
            enabled
          }
        }
        ... on NotFoundError {
          message
        }
      }
    }
  `)

  describe('luminaAgentApiKeys', () => {
    it('should query api keys', async () => {
      prismaMock.apiKey.findMany.mockResolvedValue([
        {
          id: 'apiKeyId',
          agentId: 'agentId',
          name: 'Test Key',
          key: 'test-key',
          enabled: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          lastUsedAt: new Date('2024-01-01')
        }
      ])

      const data = await authClient({
        document: API_KEYS_QUERY,
        variables: { agentId: 'agentId' }
      })

      expect(prismaMock.apiKey.findMany).toHaveBeenCalledWith({
        where: {
          agentId: 'agentId',
          agent: { team: { members: { some: { userId: 'testUserId' } } } }
        }
      })
      expect(data).toHaveProperty('data.luminaAgentApiKeys', [
        {
          id: 'apiKeyId',
          agentId: 'agentId',
          name: 'Test Key',
          key: 'test-key',
          enabled: true,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          lastUsedAt: expect.any(Date)
        }
      ])
    })
  })

  describe('luminaAgentApiKey', () => {
    it('should query single api key', async () => {
      prismaMock.apiKey.findUnique.mockResolvedValue({
        id: 'apiKeyId',
        agentId: 'agentId',
        name: 'Test Key',
        key: 'test-key-123',
        enabled: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        lastUsedAt: null
      })

      const data = await authClient({
        document: API_KEY_QUERY,
        variables: { id: 'apiKeyId' }
      })

      expect(data).toHaveProperty('data.luminaAgentApiKey.data', {
        id: 'apiKeyId',
        agentId: 'agentId',
        name: 'Test Key',
        enabled: true
      })
    })

    it('should return NotFoundError when api key not found', async () => {
      prismaMock.apiKey.findUnique.mockResolvedValue(null)

      const data = await authClient({
        document: API_KEY_QUERY,
        variables: { id: 'nonExistentId' }
      })

      expect(data).toHaveProperty(
        'data.luminaAgentApiKey.message',
        'API key not found'
      )
    })
  })
})
