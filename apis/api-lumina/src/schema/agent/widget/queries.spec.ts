import { graphql } from '@core/shared/gql'

import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'

describe('agent widget queries', () => {
  const authClient = getClient({
    headers: {
      authorization: 'token'
    }
  })

  const WIDGETS_QUERY = graphql(`
    query LuminaAgentWidgets($agentId: ID!) {
      luminaAgentWidgets(agentId: $agentId) {
        id
        agentId
        name
        enabled
        position
        theme
        buttonText
        buttonIcon
        primaryColor
        allowedDomains
        createdAt
        updatedAt
      }
    }
  `)

  const WIDGET_QUERY = graphql(`
    query LuminaAgentWidget($id: ID!) {
      luminaAgentWidget(id: $id) {
        ... on QueryLuminaAgentWidgetSuccess {
          data {
            id
            agentId
            name
            enabled
            position
            theme
            buttonText
            buttonIcon
            primaryColor
            allowedDomains
            createdAt
            updatedAt
          }
        }
        ... on NotFoundError {
          message
        }
      }
    }
  `)

  describe('luminaAgentWidgets', () => {
    it('should query widgets', async () => {
      prismaMock.widget.findMany.mockResolvedValue([
        {
          id: 'widgetId',
          agentId: 'agentId',
          name: 'Test Widget',
          enabled: true,
          allowedDomains: [],
          position: null,
          theme: null,
          buttonText: null,
          buttonIcon: null,
          primaryColor: null,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        }
      ])

      const data = await authClient({
        document: WIDGETS_QUERY,
        variables: { agentId: 'agentId' }
      })

      expect(data).toHaveProperty('data.luminaAgentWidgets', [
        {
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
          createdAt: new Date('2024-01-01').toISOString(),
          updatedAt: new Date('2024-01-01').toISOString()
        }
      ])
    })
  })

  describe('luminaAgentWidget', () => {
    it('should query single widget', async () => {
      prismaMock.widget.findUnique.mockResolvedValue({
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
        document: WIDGET_QUERY,
        variables: { id: 'widgetId' }
      })

      expect(data).toHaveProperty('data.luminaAgentWidget.data', {
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
        createdAt: new Date('2024-01-01').toISOString(),
        updatedAt: new Date('2024-01-01').toISOString()
      })
    })

    it('should return NotFoundError when widget not found', async () => {
      prismaMock.widget.findUnique.mockResolvedValue(null)

      const data = await authClient({
        document: WIDGET_QUERY,
        variables: { id: 'nonExistentId' }
      })

      expect(data).toHaveProperty(
        'data.luminaAgentWidget.message',
        'Widget not found'
      )
    })
  })
})
