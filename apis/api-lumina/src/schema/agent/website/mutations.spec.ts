import { Agent, Team, TeamMember, Website } from '@core/prisma/lumina/client'
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
            subdomain
            customDomain
            metaTitle
            metaDescription
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

  const UPDATE_WEBSITE_MUTATION = graphql(`
    mutation UpdateWebsite($id: ID!, $input: LuminaAgentWebsiteUpdateInput!) {
      luminaAgentWebsiteUpdate(id: $id, input: $input) {
        ... on MutationLuminaAgentWebsiteUpdateSuccess {
          data {
            id
            agentId
            name
            enabled
            subdomain
            customDomain
            metaTitle
            metaDescription
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

      prismaMock.website.create.mockResolvedValue({
        id: 'newWebsiteId',
        agentId: '0acf531f-620a-470b-a15a-004616285138',
        name: 'New Website',
        enabled: true,
        subdomain: 'test',
        customDomain: 'test.com',
        metaTitle: 'Test Title',
        metaDescription: 'Test Description',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      })

      const data = await authClient({
        document: CREATE_WEBSITE_MUTATION,
        variables: {
          input: {
            agentId: '0acf531f-620a-470b-a15a-004616285138',
            name: 'New Website',
            enabled: true,
            subdomain: 'test',
            customDomain: 'test.com',
            metaTitle: 'Test Title',
            metaDescription: 'Test Description'
          }
        }
      })

      expect(data).toHaveProperty('data.luminaAgentWebsiteCreate.data', {
        id: 'newWebsiteId',
        agentId: '0acf531f-620a-470b-a15a-004616285138',
        name: 'New Website',
        enabled: true,
        subdomain: 'test',
        customDomain: 'test.com',
        metaTitle: 'Test Title',
        metaDescription: 'Test Description',
        createdAt: new Date('2024-01-01').toISOString(),
        updatedAt: new Date('2024-01-01').toISOString()
      })
    })

    it('should reject if agent not found', async () => {
      prismaMock.agent.findUnique.mockResolvedValue(null)

      const data = await authClient({
        document: CREATE_WEBSITE_MUTATION,
        variables: {
          input: {
            agentId: '0acf531f-620a-470b-a15a-004616285138',
            name: 'New Website',
            enabled: true,
            subdomain: 'test',
            customDomain: 'test.com',
            metaTitle: 'Test Title',
            metaDescription: 'Test Description'
          }
        }
      })

      expect(data).toHaveProperty(
        'data.luminaAgentWebsiteCreate.message',
        'Agent not found'
      )
    })

    it('should reject if user is not a member of the team', async () => {
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
        document: CREATE_WEBSITE_MUTATION,
        variables: {
          input: {
            agentId: '0acf531f-620a-470b-a15a-004616285138',
            name: 'New Website',
            enabled: true,
            subdomain: 'test',
            customDomain: 'test.com',
            metaTitle: 'Test Title',
            metaDescription: 'Test Description'
          }
        }
      })

      expect(data).toHaveProperty(
        'data.luminaAgentWebsiteCreate.message',
        'User is not a member of the team'
      )
    })

    it('should reject if input is invalid', async () => {
      const data = await authClient({
        document: CREATE_WEBSITE_MUTATION,
        variables: {
          input: {
            agentId: 'zzz',
            name: '',
            enabled: true,
            subdomain: 'test.com',
            customDomain: 'invalid domain'
          }
        }
      })

      expect(data).toHaveProperty('data.luminaAgentWebsiteCreate.fieldErrors', [
        {
          message: 'Agent ID must be a valid UUID',
          path: ['input', 'agentId']
        },
        {
          message: 'Name is required',
          path: ['input', 'name']
        },
        {
          message: 'Invalid subdomain (letters, numbers, and hyphens only)',
          path: ['input', 'subdomain']
        },
        {
          message: 'Invalid custom domain (e.g., example.com)',
          path: ['input', 'customDomain']
        }
      ])
    })
  })

  describe('luminaAgentWebsiteUpdate', () => {
    it('should update website', async () => {
      const website: Website & {
        agent: Agent & { team: Team & { members: TeamMember[] } }
      } = {
        id: 'websiteId',
        agentId: 'agentId',
        name: 'Test Website',
        enabled: true,
        subdomain: null,
        customDomain: null,
        metaTitle: null,
        metaDescription: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
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
      prismaMock.website.findUnique.mockResolvedValue(website)

      prismaMock.website.update.mockResolvedValue({
        id: 'websiteId',
        agentId: 'agentId',
        name: 'Updated Website',
        enabled: false,
        subdomain: 'test',
        customDomain: 'test.com',
        metaTitle: 'Test Title',
        metaDescription: 'Test Description',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      })

      const data = await authClient({
        document: UPDATE_WEBSITE_MUTATION,
        variables: {
          id: 'websiteId',
          input: {
            name: 'Updated Website',
            enabled: false,
            subdomain: 'test',
            customDomain: 'test.com',
            metaTitle: 'Test Title',
            metaDescription: 'Test Description'
          }
        }
      })

      expect(data).toHaveProperty('data.luminaAgentWebsiteUpdate.data', {
        id: 'websiteId',
        agentId: 'agentId',
        name: 'Updated Website',
        enabled: false,
        subdomain: 'test',
        customDomain: 'test.com',
        metaTitle: 'Test Title',
        metaDescription: 'Test Description',
        createdAt: new Date('2024-01-01').toISOString(),
        updatedAt: new Date('2024-01-01').toISOString()
      })
    })

    it('should keep existing values if not provided', async () => {
      const website: Website & {
        agent: Agent & { team: Team & { members: TeamMember[] } }
      } = {
        id: 'websiteId',
        agentId: 'agentId',
        name: 'Test Website',
        enabled: true,
        subdomain: null,
        customDomain: null,
        metaTitle: null,
        metaDescription: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
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
      prismaMock.website.findUnique.mockResolvedValue(website)

      prismaMock.website.update.mockResolvedValue({
        id: 'websiteId',
        agentId: 'agentId',
        name: 'Test Website',
        enabled: true,
        subdomain: null,
        customDomain: null,
        metaTitle: 'Test Title',
        metaDescription: 'Test Description',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      })

      const data = await authClient({
        document: UPDATE_WEBSITE_MUTATION,
        variables: {
          id: 'websiteId',
          input: {
            metaTitle: 'Test Title',
            metaDescription: 'Test Description'
          }
        }
      })

      expect(data).toHaveProperty('data.luminaAgentWebsiteUpdate.data', {
        id: 'websiteId',
        agentId: 'agentId',
        name: 'Test Website',
        enabled: true,
        subdomain: null,
        customDomain: null,
        metaTitle: 'Test Title',
        metaDescription: 'Test Description',
        createdAt: new Date('2024-01-01').toISOString(),
        updatedAt: new Date('2024-01-01').toISOString()
      })
    })

    it('should reject if website not found', async () => {
      prismaMock.website.findUnique.mockResolvedValue(null)

      const data = await authClient({
        document: UPDATE_WEBSITE_MUTATION,
        variables: {
          id: 'websiteId',
          input: { name: 'Updated Website', enabled: false }
        }
      })

      expect(data).toHaveProperty(
        'data.luminaAgentWebsiteUpdate.message',
        'Website not found'
      )
    })

    it('should reject if user is not a member of the team', async () => {
      const website: Website & {
        agent: Agent & { team: Team & { members: TeamMember[] } }
      } = {
        id: 'websiteId',
        agentId: 'agentId',
        name: 'Test Website',
        enabled: true,
        subdomain: null,
        customDomain: null,
        metaTitle: null,
        metaDescription: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
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
      prismaMock.website.findUnique.mockResolvedValue(website)

      const data = await authClient({
        document: UPDATE_WEBSITE_MUTATION,
        variables: {
          id: 'websiteId',
          input: {
            name: 'Updated Website',
            enabled: false,
            subdomain: 'test',
            customDomain: 'test.com',
            metaTitle: 'Test Title',
            metaDescription: 'Test Description'
          }
        }
      })

      expect(data).toHaveProperty(
        'data.luminaAgentWebsiteUpdate.message',
        'User is not a member of the team'
      )
    })

    it('should reject if input is invalid', async () => {
      const data = await authClient({
        document: UPDATE_WEBSITE_MUTATION,
        variables: {
          id: 'websiteId',
          input: {
            name: '',
            enabled: false,
            subdomain: 'test.com',
            customDomain: 'invalid domain'
          }
        }
      })

      expect(data).toHaveProperty('data.luminaAgentWebsiteUpdate.fieldErrors', [
        {
          message: 'Name is required',
          path: ['input', 'name']
        },
        {
          message: 'Invalid subdomain (letters, numbers, and hyphens only)',
          path: ['input', 'subdomain']
        },
        {
          message: 'Invalid custom domain (e.g., example.com)',
          path: ['input', 'customDomain']
        }
      ])
    })
  })

  describe('luminaAgentWebsiteDelete', () => {
    it('should delete website', async () => {
      const website: Website & {
        agent: Agent & { team: Team & { members: TeamMember[] } }
      } = {
        id: 'websiteId',
        agentId: 'agentId',
        name: 'Test Website',
        enabled: true,
        subdomain: null,
        customDomain: null,
        metaTitle: null,
        metaDescription: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
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
      prismaMock.website.findUnique.mockResolvedValue(website)

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

    it('should reject if website not found', async () => {
      prismaMock.website.findUnique.mockResolvedValue(null)

      const data = await authClient({
        document: DELETE_WEBSITE_MUTATION,
        variables: { id: 'websiteId' }
      })

      expect(data).toHaveProperty(
        'data.luminaAgentWebsiteDelete.message',
        'Website not found'
      )
    })

    it('should reject if user is not a member of the team', async () => {
      const website: Website & {
        agent: Agent & { team: Team & { members: TeamMember[] } }
      } = {
        id: 'websiteId',
        agentId: 'agentId',
        name: 'Test Website',
        enabled: true,
        subdomain: null,
        customDomain: null,
        metaTitle: null,
        metaDescription: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
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
      prismaMock.website.findUnique.mockResolvedValue(website)

      const data = await authClient({
        document: DELETE_WEBSITE_MUTATION,
        variables: { id: 'websiteId' }
      })

      expect(data).toHaveProperty(
        'data.luminaAgentWebsiteDelete.message',
        'User is not a member of the team'
      )
    })
  })
})
