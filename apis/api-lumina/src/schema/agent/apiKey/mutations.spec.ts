import { Agent, ApiKey, Team, TeamMember } from '@core/prisma/lumina/client'
import { graphql } from '@core/shared/gql'

import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'

jest.mock('crypto', () => ({
  ...jest.requireActual('crypto'),
  randomBytes: jest.fn().mockReturnValue(Buffer.from('test-key-123'))
}))

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
            createdAt
            updatedAt
            lastUsedAt
          }
        }
        ... on ForbiddenError {
          message
        }
        ... on NotFoundError {
          message
        }
        ... on ZodError {
          fieldErrors {
            message
            path
          }
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
            agentId
            name
            key
            enabled
            createdAt
            updatedAt
            lastUsedAt
          }
        }
        ... on ForbiddenError {
          message
        }
        ... on NotFoundError {
          message
        }
        ... on ZodError {
          fieldErrors {
            message
            path
          }
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
        agentId: '0acf531f-620a-470b-a15a-004616285138',
        name: 'New Key',
        key: '746573742d6b65792d313233',
        enabled: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        lastUsedAt: null
      })

      const data = await authClient({
        document: CREATE_API_KEY_MUTATION,
        variables: {
          input: {
            agentId: '0acf531f-620a-470b-a15a-004616285138',
            name: 'New Key',
            enabled: true
          }
        }
      })

      expect(prismaMock.apiKey.create).toHaveBeenCalledWith({
        data: {
          agentId: '0acf531f-620a-470b-a15a-004616285138',
          name: 'New Key',
          key: '746573742d6b65792d313233',
          enabled: true
        }
      })

      expect(data).toHaveProperty('data.luminaAgentApiKeyCreate.data', {
        id: 'newApiKeyId',
        agentId: '0acf531f-620a-470b-a15a-004616285138',
        name: 'New Key',
        key: '746573742d6b65792d313233',
        enabled: true,
        createdAt: new Date('2024-01-01').toISOString(),
        updatedAt: new Date('2024-01-01').toISOString(),
        lastUsedAt: null
      })
    })

    it('should reject if agent not found', async () => {
      prismaMock.agent.findUnique.mockResolvedValue(null)

      const data = await authClient({
        document: CREATE_API_KEY_MUTATION,
        variables: {
          input: {
            agentId: '0acf531f-620a-470b-a15a-004616285138',
            name: 'New Key',
            enabled: true
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
            agentId: '0acf531f-620a-470b-a15a-004616285138',
            name: 'New Key',
            enabled: true
          }
        }
      })

      expect(data).toHaveProperty(
        'data.luminaAgentApiKeyCreate.message',
        'User is not a member of the team'
      )
    })

    it('should reject if input is invalid', async () => {
      const data = await authClient({
        document: CREATE_API_KEY_MUTATION,
        variables: {
          input: { agentId: 'invalid-agent-id', name: '', enabled: true }
        }
      })

      expect(data).toHaveProperty('data.luminaAgentApiKeyCreate.fieldErrors', [
        {
          message: 'Agent ID must be a valid UUID',
          path: ['input', 'agentId']
        },
        {
          message: 'Name is required',
          path: ['input', 'name']
        }
      ])
    })
  })

  describe('luminaAgentApiKeyUpdate', () => {
    it('should update api key', async () => {
      const apiKey: ApiKey & {
        agent: Agent & { team: Team & { members: TeamMember[] } }
      } = {
        id: 'apiKeyId',
        agentId: 'agentId',
        name: 'Test Key',
        key: 'test-key',
        enabled: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        lastUsedAt: null,
        agent: {
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
      }
      prismaMock.apiKey.findUnique.mockResolvedValue(apiKey)

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
        agentId: 'agentId',
        key: 'test-key-123',
        name: 'Updated Key',
        enabled: false,
        createdAt: new Date('2024-01-01').toISOString(),
        updatedAt: new Date('2024-01-01').toISOString(),
        lastUsedAt: null
      })
    })

    it('should keep existing values if not provided', async () => {
      const apiKey: ApiKey & {
        agent: Agent & { team: Team & { members: TeamMember[] } }
      } = {
        id: 'apiKeyId',
        agentId: 'agentId',
        name: 'Test Key',
        key: 'test-key',
        enabled: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        lastUsedAt: null,
        agent: {
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
      }
      prismaMock.apiKey.findUnique.mockResolvedValue(apiKey)

      prismaMock.apiKey.update.mockResolvedValue({
        id: 'apiKeyId',
        agentId: 'agentId',
        name: 'Test Key',
        key: 'test-key',
        enabled: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        lastUsedAt: null
      })

      const data = await authClient({
        document: UPDATE_API_KEY_MUTATION,
        variables: {
          id: 'apiKeyId',
          input: {}
        }
      })

      expect(data).toHaveProperty('data.luminaAgentApiKeyUpdate.data', {
        id: 'apiKeyId',
        agentId: 'agentId',
        key: 'test-key',
        name: 'Test Key',
        enabled: true,
        createdAt: new Date('2024-01-01').toISOString(),
        updatedAt: new Date('2024-01-01').toISOString(),
        lastUsedAt: null
      })
    })

    it('should reject if api key not found', async () => {
      prismaMock.apiKey.findUnique.mockResolvedValue(null)

      const data = await authClient({
        document: UPDATE_API_KEY_MUTATION,
        variables: {
          id: 'nonExistentApiKeyId',
          input: { name: 'Updated Key', enabled: false }
        }
      })

      expect(data).toHaveProperty(
        'data.luminaAgentApiKeyUpdate.message',
        'API key not found'
      )
    })

    it('should reject if user is not team member', async () => {
      const apiKey: ApiKey & {
        agent: Agent & { team: Team & { members: TeamMember[] } }
      } = {
        id: 'apiKeyId',
        agentId: 'agentId',
        name: 'Test Key',
        key: 'test-key',
        enabled: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        lastUsedAt: null,
        agent: {
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
      }
      prismaMock.apiKey.findUnique.mockResolvedValue(apiKey)

      const data = await authClient({
        document: UPDATE_API_KEY_MUTATION,
        variables: {
          id: 'apiKeyId',
          input: { name: 'Updated Key', enabled: false }
        }
      })

      expect(data).toHaveProperty(
        'data.luminaAgentApiKeyUpdate.message',
        'User is not a member of the team'
      )
    })

    it('should reject if input is invalid', async () => {
      const data = await authClient({
        document: UPDATE_API_KEY_MUTATION,
        variables: { id: 'apiKeyId', input: { name: '', enabled: false } }
      })
      expect(data).toHaveProperty('data.luminaAgentApiKeyUpdate.fieldErrors', [
        {
          message: 'Name is required',
          path: ['input', 'name']
        }
      ])
    })
  })

  describe('luminaAgentApiKeyDelete', () => {
    it('should delete api key', async () => {
      const apiKey: ApiKey & {
        agent: Agent & { team: Team & { members: TeamMember[] } }
      } = {
        id: 'apiKeyId',
        agentId: 'agentId',
        name: 'Test Key',
        key: 'test-key',
        enabled: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        lastUsedAt: null,
        agent: {
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
      }
      prismaMock.apiKey.findUnique.mockResolvedValue(apiKey)

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

    it('should reject if api key not found', async () => {
      prismaMock.apiKey.findUnique.mockResolvedValue(null)

      const data = await authClient({
        document: DELETE_API_KEY_MUTATION,
        variables: { id: 'nonExistentApiKeyId' }
      })

      expect(data).toHaveProperty(
        'data.luminaAgentApiKeyDelete.message',
        'API key not found'
      )
    })

    it('should reject if user is not team member', async () => {
      const apiKey: ApiKey & {
        agent: Agent & { team: Team & { members: TeamMember[] } }
      } = {
        id: 'apiKeyId',
        agentId: 'agentId',
        name: 'Test Key',
        key: 'test-key',
        enabled: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        lastUsedAt: null,
        agent: {
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
      }
      prismaMock.apiKey.findUnique.mockResolvedValue(apiKey)

      const data = await authClient({
        document: DELETE_API_KEY_MUTATION,
        variables: { id: 'apiKeyId' }
      })

      expect(data).toHaveProperty(
        'data.luminaAgentApiKeyDelete.message',
        'User is not a member of the team'
      )
    })
  })
})
