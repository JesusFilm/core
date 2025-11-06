import { Agent, Team, TeamMember } from '@core/prisma/lumina/client'
import { graphql } from '@core/shared/gql'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'

describe('agent mutations', () => {
  const authClient = getClient({
    headers: {
      authorization: 'token'
    }
  })

  const CREATE_AGENT_MUTATION = graphql(`
    mutation CreateAgent($input: LuminaAgentCreateInput!) {
      luminaAgentCreate(input: $input) {
        ... on MutationLuminaAgentCreateSuccess {
          data {
            id
            teamId
            name
            description
            model
            temperature
            maxTokens
            topP
            frequencyPenalty
            presencePenalty
            systemPrompt
            createdAt
            updatedAt
          }
        }
        ... on ForbiddenError {
          message
          location {
            path
            value
          }
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

  const UPDATE_AGENT_MUTATION = graphql(`
    mutation UpdateAgent($id: ID!, $input: LuminaAgentUpdateInput!) {
      luminaAgentUpdate(id: $id, input: $input) {
        ... on MutationLuminaAgentUpdateSuccess {
          data {
            id
            name
            model
            temperature
            maxTokens
            topP
            frequencyPenalty
            presencePenalty
            systemPrompt
            createdAt
            updatedAt
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

  const DELETE_AGENT_MUTATION = graphql(`
    mutation DeleteAgent($id: ID!) {
      luminaAgentDelete(id: $id) {
        ... on MutationLuminaAgentDeleteSuccess {
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

  describe('luminaAgentCreate', () => {
    it('should create agent', async () => {
      prismaMock.teamMember.findUnique.mockResolvedValue({
        id: 'memberId',
        teamId: 'teamId',
        userId: 'testUserId',
        role: 'OWNER',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      })

      prismaMock.agent.create.mockResolvedValue({
        id: 'newAgentId',
        teamId: '0acf531f-620a-470b-a15a-004616285138',
        name: 'New Agent',
        description: 'New Description',
        model: 'gpt-4',
        systemPrompt: null,
        temperature: 0.7,
        maxTokens: null,
        topP: null,
        frequencyPenalty: null,
        presencePenalty: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      })

      const data = await authClient({
        document: CREATE_AGENT_MUTATION,
        variables: {
          input: {
            teamId: '0acf531f-620a-470b-a15a-004616285138',
            name: 'New Agent',
            description: 'New Description',
            model: 'gpt-4',
            temperature: 0.7
          }
        }
      })

      expect(prismaMock.teamMember.findUnique).toHaveBeenCalledWith({
        where: {
          teamId_userId: {
            teamId: '0acf531f-620a-470b-a15a-004616285138',
            userId: 'testUserId'
          }
        }
      })
      expect(prismaMock.agent.create).toHaveBeenCalled()
      expect(data).toHaveProperty('data.luminaAgentCreate.data', {
        id: 'newAgentId',
        teamId: '0acf531f-620a-470b-a15a-004616285138',
        name: 'New Agent',
        description: 'New Description',
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: null,
        topP: null,
        frequencyPenalty: null,
        presencePenalty: null,
        systemPrompt: null,
        createdAt: new Date('2024-01-01').toISOString(),
        updatedAt: new Date('2024-01-01').toISOString()
      })
    })

    it('should reject if user is not team member', async () => {
      prismaMock.teamMember.findUnique.mockResolvedValue(null)

      const data = await authClient({
        document: CREATE_AGENT_MUTATION,
        variables: {
          input: {
            teamId: '0acf531f-620a-470b-a15a-004616285138',
            name: 'New Agent',
            model: 'gpt-4',
            temperature: 0.7
          }
        }
      })

      expect(data).toHaveProperty(
        'data.luminaAgentCreate.message',
        'Access denied'
      )
    })

    it('should reject if input is not valid', async () => {
      const data = await authClient({
        document: CREATE_AGENT_MUTATION,
        variables: {
          input: {
            teamId: 'invalid-team-id',
            name: '',
            model: '',
            temperature: 3,
            topP: 1.1,
            frequencyPenalty: 3,
            presencePenalty: 3
          }
        }
      })
      expect(data).toHaveProperty('data.luminaAgentCreate.fieldErrors', [
        { message: 'Team ID must be a valid UUID', path: ['input', 'teamId'] },
        { message: 'Name is required', path: ['input', 'name'] },
        { message: 'Model is required', path: ['input', 'model'] },
        {
          message: 'Number must be less than or equal to 2',
          path: ['input', 'temperature']
        },
        {
          message: 'Number must be less than or equal to 1',
          path: ['input', 'topP']
        },
        {
          message: 'Number must be less than or equal to 2',
          path: ['input', 'frequencyPenalty']
        },
        {
          message: 'Number must be less than or equal to 2',
          path: ['input', 'presencePenalty']
        }
      ])
    })
  })

  describe('luminaAgentUpdate', () => {
    it('should update agent', async () => {
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

      prismaMock.agent.update.mockResolvedValue({
        id: 'agentId',
        teamId: 'teamId',
        name: 'Updated Agent',
        description: null,
        model: 'gpt-3.5-turbo',
        systemPrompt: null,
        temperature: 0.8,
        maxTokens: null,
        topP: null,
        frequencyPenalty: null,
        presencePenalty: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      })

      const data = await authClient({
        document: UPDATE_AGENT_MUTATION,
        variables: {
          id: 'agentId',
          input: {
            name: 'Updated Agent',
            model: 'gpt-3.5-turbo',
            temperature: 0.8
          }
        }
      })

      expect(prismaMock.agent.update).toHaveBeenCalled()
      expect(data).toHaveProperty('data.luminaAgentUpdate.data', {
        id: 'agentId',
        name: 'Updated Agent',
        model: 'gpt-3.5-turbo',
        temperature: 0.8,
        maxTokens: null,
        topP: null,
        frequencyPenalty: null,
        presencePenalty: null,
        systemPrompt: null,
        createdAt: new Date('2024-01-01').toISOString(),
        updatedAt: new Date('2024-01-01').toISOString()
      })
    })

    it('should update agent with undefined values', async () => {
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

      prismaMock.agent.update.mockResolvedValue({
        id: 'agentId',
        teamId: 'teamId',
        name: 'Updated Agent',
        description: null,
        model: 'gpt-4',
        temperature: 1.0,
        maxTokens: null,
        topP: null,
        frequencyPenalty: null,
        presencePenalty: null,
        systemPrompt: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      })

      const data = await authClient({
        document: UPDATE_AGENT_MUTATION,
        variables: {
          id: 'agentId',
          input: {}
        }
      })

      expect(data).toHaveProperty('data.luminaAgentUpdate.data', {
        id: 'agentId',
        name: 'Updated Agent',
        model: 'gpt-4',
        temperature: 1.0,
        maxTokens: null,
        topP: null,
        frequencyPenalty: null,
        presencePenalty: null,
        systemPrompt: null,
        createdAt: new Date('2024-01-01').toISOString(),
        updatedAt: new Date('2024-01-01').toISOString()
      })
    })

    it('should reject if agent not found', async () => {
      prismaMock.agent.findUnique.mockResolvedValue(null)

      const data = await authClient({
        document: UPDATE_AGENT_MUTATION,
        variables: {
          id: 'nonExistentId',
          input: { name: 'Updated Agent' }
        }
      })

      expect(data).toHaveProperty(
        'data.luminaAgentUpdate.message',
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
        document: UPDATE_AGENT_MUTATION,
        variables: {
          id: 'agentId',
          input: { name: 'Updated Agent' }
        }
      })

      expect(data).toHaveProperty(
        'data.luminaAgentUpdate.message',
        'Access denied'
      )
    })
  })

  describe('luminaAgentDelete', () => {
    it('should delete agent', async () => {
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

      prismaMock.agent.delete.mockResolvedValue({
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
        updatedAt: new Date('2024-01-01')
      })

      const data = await authClient({
        document: DELETE_AGENT_MUTATION,
        variables: { id: 'agentId' }
      })

      expect(prismaMock.agent.delete).toHaveBeenCalledWith({
        where: { id: 'agentId' }
      })
      expect(data).toHaveProperty('data.luminaAgentDelete.data', {
        id: 'agentId'
      })
    })

    it('should reject if agent not found', async () => {
      prismaMock.agent.findUnique.mockResolvedValue(null)

      const data = await authClient({
        document: DELETE_AGENT_MUTATION,
        variables: { id: 'nonExistentId' }
      })

      expect(data).toHaveProperty(
        'data.luminaAgentDelete.message',
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
        document: DELETE_AGENT_MUTATION,
        variables: { id: 'agentId' }
      })

      expect(data).toHaveProperty(
        'data.luminaAgentDelete.message',
        'Access denied'
      )
    })
  })
})
