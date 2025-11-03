import { graphql } from '@core/shared/gql'

import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'

describe('agent website mutations', () => {
  const authClient = getClient({
    headers: {
      authorization: 'token'
    }
  })

  const CREATE_WEBSITE_MUTATION = graphql(`
    mutation CreateWebsite($input: LuminaAgentWebsiteCreateInput!) {
      luminaAgentWebsiteCreate(input: $input) {
        ... on MutationLuminaAgentWebsiteCreateSuccess {
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

  const UPDATE_WEBSITE_MUTATION = graphql(`
    mutation UpdateWebsite($id: ID!, $input: LuminaAgentWebsiteUpdateInput!) {
      luminaAgentWebsiteUpdate(id: $id, input: $input) {
        ... on MutationLuminaAgentWebsiteUpdateSuccess {
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

  const DELETE_WEBSITE_MUTATION = graphql(`
    mutation DeleteWebsite($id: ID!) {
      luminaAgentWebsiteDelete(id: $id) {
        ... on MutationLuminaAgentWebsiteDeleteSuccess {
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

  describe('luminaAgentWebsiteCreate', () => {
    it('should create website', async () => {
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

      prismaMock.website.create.mockResolvedValue({
        id: 'newWebsiteId',
        agentId: 'agentId',
        name: 'New Website',
        enabled: true,
        subdomain: null,
        customDomain: null,
        metaTitle: null,
        metaDescription: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      })

      const data = await authClient({
        document: CREATE_WEBSITE_MUTATION,
        variables: {
          input: {
            agentId: 'agentId',
            name: 'New Website'
          }
        }
      })

      expect(data).toHaveProperty('data.luminaAgentWebsiteCreate.data', {
        id: 'newWebsiteId',
        agentId: 'agentId',
        name: 'New Website',
        enabled: true
      })
    })
  })

  describe('luminaAgentWebsiteUpdate', () => {
    it('should update website', async () => {
      prismaMock.website.findUnique.mockResolvedValue({
        id: 'websiteId',
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

      prismaMock.website.update.mockResolvedValue({
        id: 'websiteId',
        agentId: 'agentId',
        name: 'Updated Website',
        enabled: false,
        subdomain: null,
        customDomain: null,
        metaTitle: null,
        metaDescription: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      })

      const data = await authClient({
        document: UPDATE_WEBSITE_MUTATION,
        variables: {
          id: 'websiteId',
          input: {
            name: 'Updated Website',
            enabled: false
          }
        }
      })

      expect(data).toHaveProperty('data.luminaAgentWebsiteUpdate.data', {
        id: 'websiteId',
        name: 'Updated Website',
        enabled: false
      })
    })
  })

  describe('luminaAgentWebsiteDelete', () => {
    it('should delete website', async () => {
      prismaMock.website.findUnique.mockResolvedValue({
        id: 'websiteId',
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

      prismaMock.website.delete.mockResolvedValue({
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
        document: DELETE_WEBSITE_MUTATION,
        variables: { id: 'websiteId' }
      })

      expect(data).toHaveProperty('data.luminaAgentWebsiteDelete.data', {
        id: 'websiteId'
      })
    })
  })
})

