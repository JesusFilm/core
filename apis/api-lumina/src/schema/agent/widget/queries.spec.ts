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
        allowedDomains
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
          allowedDomains: null
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
          allowedDomains: null
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
        enabled: true
      })

      const data = await authClient({
        document: WIDGET_QUERY,
        variables: { id: 'widgetId' }
      })

      expect(data).toHaveProperty('data.luminaAgentWidget.data', {
        id: 'widgetId',
        agentId: 'agentId',
        name: 'Test Widget',
        enabled: true
      })
    })

    it('should return NotFoundError when widget not found', async () => {
      prismaMock.widget.findUnique.mockResolvedValue(null)

      const data = await authClient({
        document: WIDGET_QUERY,
        variables: { id: 'nonExistentId' }
      })

      expect(data).toHaveProperty('data.luminaAgentWidget.message', 'Widget not found')
    })
  })
})

