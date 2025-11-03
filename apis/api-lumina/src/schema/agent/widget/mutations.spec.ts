import { graphql } from '@core/shared/gql'

import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'

describe('agent widget mutations', () => {
  const authClient = getClient({
    headers: {
      authorization: 'token'
    }
  })

  const CREATE_WIDGET_MUTATION = graphql(`
    mutation CreateWidget($input: LuminaAgentWidgetCreateInput!) {
      luminaAgentWidgetCreate(input: $input) {
        ... on MutationLuminaAgentWidgetCreateSuccess {
          data {
            id
            agentId
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

  const UPDATE_WIDGET_MUTATION = graphql(`
    mutation UpdateWidget($id: ID!, $input: LuminaAgentWidgetUpdateInput!) {
      luminaAgentWidgetUpdate(id: $id, input: $input) {
        ... on MutationLuminaAgentWidgetUpdateSuccess {
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

  const DELETE_WIDGET_MUTATION = graphql(`
    mutation DeleteWidget($id: ID!) {
      luminaAgentWidgetDelete(id: $id) {
        ... on MutationLuminaAgentWidgetDeleteSuccess {
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

  describe('luminaAgentWidgetCreate', () => {
    it('should create widget', async () => {
      prismaMock.agent.findUnique.mockResolvedValue({
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
      })

      prismaMock.widget.create.mockResolvedValue({
        id: 'newWidgetId',
        agentId: 'agentId',
        name: 'New Widget',
        enabled: true,
        position: null,
        theme: null,
        buttonText: null,
        buttonIcon: null,
        primaryColor: null,
        allowedDomains: [],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      })

      const data = await authClient({
        document: CREATE_WIDGET_MUTATION,
        variables: {
          input: {
            agentId: 'agentId',
            name: 'New Widget'
          }
        }
      })

      expect(data).toHaveProperty('data.luminaAgentWidgetCreate.data', {
        id: 'newWidgetId',
        agentId: 'agentId',
        name: 'New Widget',
        enabled: true
      })
    })
  })

  describe('luminaAgentWidgetUpdate', () => {
    it('should update widget', async () => {
      prismaMock.widget.findUnique.mockResolvedValue({
        id: 'widgetId',
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

      prismaMock.widget.update.mockResolvedValue({
        id: 'widgetId',
        agentId: 'agentId',
        name: 'Updated Widget',
        enabled: false,
        position: null,
        theme: null,
        buttonText: null,
        buttonIcon: null,
        primaryColor: null,
        allowedDomains: [],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      })

      const data = await authClient({
        document: UPDATE_WIDGET_MUTATION,
        variables: {
          id: 'widgetId',
          input: {
            name: 'Updated Widget',
            enabled: false
          }
        }
      })

      expect(data).toHaveProperty('data.luminaAgentWidgetUpdate.data', {
        id: 'widgetId',
        name: 'Updated Widget',
        enabled: false
      })
    })
  })

  describe('luminaAgentWidgetDelete', () => {
    it('should delete widget', async () => {
      prismaMock.widget.findUnique.mockResolvedValue({
        id: 'widgetId',
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

      prismaMock.widget.delete.mockResolvedValue({
        id: 'widgetId',
        agentId: 'agentId',
        name: 'Test Widget',
        enabled: true,
        position: null,
        theme: null,
        buttonText: null,
        buttonIcon: null,
        primaryColor: null,
        allowedDomains: [],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      })

      const data = await authClient({
        document: DELETE_WIDGET_MUTATION,
        variables: { id: 'widgetId' }
      })

      expect(data).toHaveProperty('data.luminaAgentWidgetDelete.data', {
        id: 'widgetId'
      })
    })
  })
})

