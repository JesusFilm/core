import { graphql } from '@core/shared/gql'

import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'

describe('agent tool queries', () => {
  const authClient = getClient({
    headers: {
      authorization: 'token'
    }
  })

  const TOOLS_QUERY = graphql(`
    query LuminaAgentTools($agentId: ID!) {
      luminaAgentTools(agentId: $agentId) {
        id
        agentId
        type
        name
        description
        parameters
        createdAt
        updatedAt
      }
    }
  `)

  const TOOL_QUERY = graphql(`
    query LuminaAgentTool($id: ID!) {
      luminaAgentTool(id: $id) {
        ... on QueryLuminaAgentToolSuccess {
          data {
            id
            agentId
            type
            name
            description
          }
        }
        ... on NotFoundError {
          message
        }
      }
    }
  `)

  describe('luminaAgentTools', () => {
    it('should query tools', async () => {
      prismaMock.agentTool.findMany.mockResolvedValue([
        {
          id: 'toolId',
          agentId: 'agentId',
          type: 'function',
          name: 'Test Tool',
          description: 'Test Description',
          parameters: '{}',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        }
      ])

      const data = await authClient({
        document: TOOLS_QUERY,
        variables: { agentId: 'agentId' }
      })

      expect(prismaMock.agentTool.findMany).toHaveBeenCalledWith({
        where: {
          agentId: 'agentId',
          agent: { team: { members: { some: { userId: 'testUserId' } } } }
        }
      })
      expect(data).toHaveProperty('data.luminaAgentTools', [
        {
          id: 'toolId',
          agentId: 'agentId',
          type: 'function',
          name: 'Test Tool',
          description: 'Test Description',
          parameters: '{}',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date)
        }
      ])
    })
  })

  describe('luminaAgentTool', () => {
    it('should query single tool', async () => {
      prismaMock.agentTool.findUnique.mockResolvedValue({
        id: 'toolId',
        agentId: 'agentId',
        type: 'function',
        name: 'Test Tool',
        description: 'Test Description',
        parameters: '{}',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      })

      const data = await authClient({
        document: TOOL_QUERY,
        variables: { id: 'toolId' }
      })

      expect(prismaMock.agentTool.findUnique).toHaveBeenCalledWith({
        where: {
          id: 'toolId',
          agent: { team: { members: { some: { userId: 'testUserId' } } } }
        }
      })
      expect(data).toHaveProperty('data.luminaAgentTool.data', {
        id: 'toolId',
        agentId: 'agentId',
        type: 'function',
        name: 'Test Tool',
        description: 'Test Description'
      })
    })

    it('should return NotFoundError when tool not found', async () => {
      prismaMock.agentTool.findUnique.mockResolvedValue(null)

      const data = await authClient({
        document: TOOL_QUERY,
        variables: { id: 'nonExistentId' }
      })

      expect(data).toHaveProperty('data.luminaAgentTool.message', 'Agent tool not found')
    })
  })
})

