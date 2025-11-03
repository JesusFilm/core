import { Agent, Team, TeamMember } from '@core/prisma/lumina/client'
import { graphql } from '@core/shared/gql'

import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'

describe('agent apiKey mutations', () => {
  const mockUser = {
    id: 'testUserId',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    emailVerified: true,
    imageUrl: null,
    roles: []
  }

  const authClient = getClient({
    headers: {
      authorization: 'token'
    },
    context: { user: mockUser }
  })

  const CREATE_API_KEY_MUTATION = graphql(`
    mutation CreateApiKey($input: LuminaAgentApiKeyCreateInput!) {
      luminaAgentApiKeyCreate(input: $input) {
        ... on MutationLuminaAgentApiKeyCreateSuccess {
          data {
            id
            agentId
            name
            key
            enabled
          }
        }
        ... on ForbiddenError {
          message
        }
        ... on NotFoundError {
          message
        }
      }
    }
  `)

  const UPDATE_API_KEY_MUTATION = graphql(`
    mutation UpdateApiKey($id: ID!, $input: LuminaAgentApiKeyUpdateInput!) {
      luminaAgentApiKeyUpdate(id: $id, input: $input) {
        ... on MutationLuminaAgentApiKeyUpdateSuccess {
          data {
            id
            name
            enabled
          }
        }
        ... on ForbiddenError {
          message
        }
        ... on NotFoundError {
          message
        }
      }
    }
  `)

  const DELETE_API_KEY_MUTATION = graphql(`
    mutation DeleteApiKey($id: ID!) {
      luminaAgentApiKeyDelete(id: $id) {
        ... on MutationLuminaAgentApiKeyDeleteSuccess {
          data {
            id
          }
        }
        ... on ForbiddenError {
          message
        }
        ... on NotFoundError {
          message
        }
      }
    }
  `)

  describe('luminaAgentApiKeyCreate', () => {
    it('should create api key', async () => {
      const agent: Agent & { team: Team & { members: TeamMember[] } } = {
        id: 'agentId',
        teamId: 'teamId',
        name: 'Test Agent',
        description: null,
        model: 'gpt-4',
        systemPrompt: null,
        temperature: 1.0,
        maxTokens: null,
        topP: null,
        frequencyPenalty: null,
        presencePenalty: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        team: {
          id: 'teamId',
          name: 'Test Team',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          members: [
            {
              id: 'memberId',
              teamId: 'teamId',
              userId: 'testUserId',
              role: 'OWNER',
              createdAt: new Date('2024-01-01'),
              updatedAt: new Date('2024-01-01')
            }
          ]
        }
      }

      prismaMock.agent.findUnique.mockResolvedValue(agent)

      prismaMock.apiKey.create.mockResolvedValue({
        id: 'newApiKeyId',
        agentId: 'agentId',
        name: 'New Key',
        key: 'generated-key-123',
        enabled: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        lastUsedAt: null
      })

      const data = await authClient({
        document: CREATE_API_KEY_MUTATION,
        variables: {
          input: {
            agentId: 'agentId',
            name: 'New Key'
          }
        }
      })

      expect(prismaMock.apiKey.create).toHaveBeenCalled()
      expect(data).toHaveProperty('data.luminaAgentApiKeyCreate.data.key')
      expect(data).toHaveProperty(
        'data.luminaAgentApiKeyCreate.data.name',
        'New Key'
      )
    })

    it('should reject if agent not found', async () => {
      prismaMock.agent.findUnique.mockResolvedValue(null)

      const data = await authClient({
        document: CREATE_API_KEY_MUTATION,
        variables: {
          input: {
            agentId: 'nonExistentId',
            name: 'New Key'
          }
        }
      })

      expect(data).toHaveProperty(
        'data.luminaAgentApiKeyCreate.message',
        'Agent not found'
      )
    })

    it('should reject if user is not team member', async () => {
      const agent: Agent & { team: Team & { members: TeamMember[] } } = {
        id: 'agentId',
        teamId: 'teamId',
        name: 'Test Agent',
        description: null,
        model: 'gpt-4',
        systemPrompt: null,
        temperature: 1.0,
        maxTokens: null,
        topP: null,
        frequencyPenalty: null,
        presencePenalty: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        team: {
          id: 'teamId',
          name: 'Test Team',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          members: []
        }
      }

      prismaMock.agent.findUnique.mockResolvedValue(agent)

      const data = await authClient({
        document: CREATE_API_KEY_MUTATION,
        variables: {
          input: {
            agentId: 'agentId',
            name: 'New Key'
          }
        }
      })

      expect(data).toHaveProperty(
        'data.luminaAgentApiKeyCreate.message',
        'User is not a member of the team'
      )
    })
  })

  describe('luminaAgentApiKeyUpdate', () => {
    it('should update api key', async () => {
      prismaMock.apiKey.findUnique.mockResolvedValue({
        id: 'apiKeyId',
        agent: {
          id: 'agentId',
          team: {
            id: 'teamId',
            members: [
              {
                id: 'memberId',
                userId: 'testUserId',
                role: 'OWNER'
              }
            ]
          }
        }
      })

      prismaMock.apiKey.update.mockResolvedValue({
        id: 'apiKeyId',
        agentId: 'agentId',
        name: 'Updated Key',
        key: 'test-key-123',
        enabled: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        lastUsedAt: null
      })

      const data = await authClient({
        document: UPDATE_API_KEY_MUTATION,
        variables: {
          id: 'apiKeyId',
          input: {
            name: 'Updated Key',
            enabled: false
          }
        }
      })

      expect(data).toHaveProperty('data.luminaAgentApiKeyUpdate.data', {
        id: 'apiKeyId',
        name: 'Updated Key',
        enabled: false
      })
    })
  })

  describe('luminaAgentApiKeyDelete', () => {
    it('should delete api key', async () => {
      prismaMock.apiKey.findUnique.mockResolvedValue({
        id: 'apiKeyId',
        agent: {
          id: 'agentId',
          team: {
            id: 'teamId',
            members: [
              {
                id: 'memberId',
                userId: 'testUserId',
                role: 'OWNER'
              }
            ]
          }
        }
      })

      prismaMock.apiKey.delete.mockResolvedValue({
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
        document: DELETE_API_KEY_MUTATION,
        variables: { id: 'apiKeyId' }
      })

      expect(prismaMock.apiKey.delete).toHaveBeenCalledWith({
        where: { id: 'apiKeyId' }
      })
      expect(data).toHaveProperty('data.luminaAgentApiKeyDelete.data', {
        id: 'apiKeyId'
      })
    })
  })
})
