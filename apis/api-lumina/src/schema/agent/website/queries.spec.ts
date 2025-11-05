import { graphql } from '@core/shared/gql'

import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'

describe('agent website queries', () => {
  const authClient = getClient({
    headers: {
      authorization: 'token'
    }
  })

  const WEBSITES_QUERY = graphql(`
    query LuminaAgentWebsites($agentId: ID!) {
      luminaAgentWebsites(agentId: $agentId) {
        id
        agentId
        name
        enabled
        subdomain
        customDomain
        metaTitle
        metaDescription
      }
    }
  `)

  const WEBSITE_QUERY = graphql(`
    query LuminaAgentWebsite($id: ID!) {
      luminaAgentWebsite(id: $id) {
        ... on QueryLuminaAgentWebsiteSuccess {
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

  describe('luminaAgentWebsites', () => {
    it('should query websites', async () => {
      prismaMock.website.findMany.mockResolvedValue([
        {
          id: 'websiteId',
          agentId: 'agentId',
          name: 'Test Website',
          enabled: true,
          subdomain: 'test',
          customDomain: null,
          metaTitle: null,
          metaDescription: null,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        }
      ])

      const data = await authClient({
        document: WEBSITES_QUERY,
        variables: { agentId: 'agentId' }
      })

      expect(data).toHaveProperty('data.luminaAgentWebsites', [
        {
          id: 'websiteId',
          agentId: 'agentId',
          name: 'Test Website',
          enabled: true,
          subdomain: 'test',
          customDomain: null,
          metaTitle: null,
          metaDescription: null
        }
      ])
    })
  })

  describe('luminaAgentWebsite', () => {
    it('should query single website', async () => {
      prismaMock.website.findUnique.mockResolvedValue({
        id: 'websiteId',
        agentId: 'agentId',
        name: 'Test Website',
        enabled: true,
        subdomain: null,
        customDomain: null,
        metaTitle: null,
        metaDescription: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      })

      const data = await authClient({
        document: WEBSITE_QUERY,
        variables: { id: 'websiteId' }
      })

      expect(data).toHaveProperty('data.luminaAgentWebsite.data', {
        id: 'websiteId',
        agentId: 'agentId',
        name: 'Test Website',
        enabled: true
      })
    })

    it('should return NotFoundError when website not found', async () => {
      prismaMock.website.findUnique.mockResolvedValue(null)

      const data = await authClient({
        document: WEBSITE_QUERY,
        variables: { id: 'nonExistentId' }
      })

      expect(data).toHaveProperty(
        'data.luminaAgentWebsite.message',
        'Website not found'
      )
    })
  })
})
