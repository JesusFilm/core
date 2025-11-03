import { graphql } from '@core/shared/gql'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'

describe('agent queries', () => {
  const authClient = getClient({
    headers: {
      authorization: 'token'
    }
  })

  const AGENTS_QUERY = graphql(`
    query LuminaAgents {
      luminaAgents {
        id
        teamId
        name
        description
        model
        systemPrompt
        temperature
        maxTokens
        topP
        frequencyPenalty
        presencePenalty
        createdAt
        updatedAt
      }
    }
  `)

  const AGENT_QUERY = graphql(`
    query LuminaAgent($id: ID!) {
      luminaAgent(id: $id) {
        ... on QueryLuminaAgentSuccess {
          data {
            id
            teamId
            name
            description
            model
          }
        }
        ... on NotFoundError {
          message
          location {
            path
            value
          }
        }
      }
    }
  `)

  it('should query agents', async () => {
    prismaMock.agent.findMany.mockResolvedValue([
      {
        id: 'agentId',
        teamId: 'teamId',
        name: 'Test Agent',
        description: 'Test Description',
        model: 'gpt-4',
        systemPrompt: 'You are helpful',
        temperature: 0.7,
        maxTokens: 1000,
        topP: 1.0,
        frequencyPenalty: 0.0,
        presencePenalty: 0.0,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      }
    ])

    const data = await authClient({
      document: AGENTS_QUERY
    })

    expect(prismaMock.agent.findMany).toHaveBeenCalledWith({
      where: { team: { members: { some: { userId: 'testUserId' } } } }
    })
    expect(data).toHaveProperty('data.luminaAgents', [
      {
        id: 'agentId',
        teamId: 'teamId',
        name: 'Test Agent',
        description: 'Test Description',
        model: 'gpt-4',
        systemPrompt: 'You are helpful',
        temperature: 0.7,
        maxTokens: 1000,
        topP: 1.0,
        frequencyPenalty: 0.0,
        presencePenalty: 0.0,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      }
    ])
  })

  it('should query single agent', async () => {
    prismaMock.agent.findUnique.mockResolvedValue({
      id: 'agentId',
      teamId: 'teamId',
      name: 'Test Agent',
      description: 'Test Description',
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
      document: AGENT_QUERY,
      variables: { id: 'agentId' }
    })

    expect(prismaMock.agent.findUnique).toHaveBeenCalledWith({
      where: {
        id: 'agentId',
        team: { members: { some: { userId: 'testUserId' } } }
      }
    })
    expect(data).toHaveProperty('data.luminaAgent.data', {
      id: 'agentId',
      teamId: 'teamId',
      name: 'Test Agent',
      description: 'Test Description',
      model: 'gpt-4'
    })
  })

  it('should return NotFoundError when agent not found', async () => {
    prismaMock.agent.findUnique.mockResolvedValue(null)

    const data = await authClient({
      document: AGENT_QUERY,
      variables: { id: 'nonExistentId' }
    })

    expect(data).toHaveProperty('data.luminaAgent.message', 'Agent not found')
    expect(data).toHaveProperty('data.luminaAgent.location', [
      { path: ['luminaAgent', 'id'], value: 'nonExistentId' }
    ])
  })
})

