import { Agent, Team, TeamMember, Widget } from '@core/prisma/lumina/client'
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

  const UPDATE_WIDGET_MUTATION = graphql(`
    mutation UpdateWidget($id: ID!, $input: LuminaAgentWidgetUpdateInput!) {
      luminaAgentWidgetUpdate(id: $id, input: $input) {
        ... on MutationLuminaAgentWidgetUpdateSuccess {
          data {
            id
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
      const agent: Agent & { team: Team & { members: TeamMember[] } } = {
        id: '0acf531f-620a-470b-a15a-004616285138',
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

      prismaMock.widget.create.mockResolvedValue({
        id: 'newWidgetId',
        agentId: '0acf531f-620a-470b-a15a-004616285138',
        name: 'New Widget',
        enabled: true,
        position: 'bottom-right',
        theme: 'light',
        buttonText: 'Chat',
        buttonIcon: 'chat',
        primaryColor: '#000000',
        allowedDomains: ['example.com'],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      })

      const data = await authClient({
        document: CREATE_WIDGET_MUTATION,
        variables: {
          input: {
            agentId: '0acf531f-620a-470b-a15a-004616285138',
            name: 'New Widget',
            enabled: true,
            position: 'bottom-right',
            theme: 'light',
            buttonText: 'Chat',
            buttonIcon: 'chat',
            primaryColor: '#000000',
            allowedDomains: ['example.com']
          }
        }
      })

      expect(data).toHaveProperty('data.luminaAgentWidgetCreate.data', {
        id: 'newWidgetId',
        agentId: '0acf531f-620a-470b-a15a-004616285138',
        name: 'New Widget',
        enabled: true,
        position: 'bottom-right',
        theme: 'light',
        buttonText: 'Chat',
        buttonIcon: 'chat',
        primaryColor: '#000000',
        allowedDomains: ['example.com'],
        createdAt: new Date('2024-01-01').toISOString(),
        updatedAt: new Date('2024-01-01').toISOString()
      })
    })

    it('should reject if agent not found', async () => {
      prismaMock.agent.findUnique.mockResolvedValue(null)

      const data = await authClient({
        document: CREATE_WIDGET_MUTATION,
        variables: {
          input: {
            agentId: '0acf531f-620a-470b-a15a-004616285138',
            name: 'New Widget',
            enabled: true,
            position: 'bottom-right',
            theme: 'light',
            buttonText: 'Chat',
            buttonIcon: 'chat',
            primaryColor: '#000000',
            allowedDomains: ['example.com']
          }
        }
      })

      expect(data).toHaveProperty(
        'data.luminaAgentWidgetCreate.message',
        'Agent not found'
      )
    })

    it('should reject if user is not agent member', async () => {
      const agent: Agent & { team: Team & { members: TeamMember[] } } = {
        id: '0acf531f-620a-470b-a15a-004616285138',
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
        document: CREATE_WIDGET_MUTATION,
        variables: {
          input: {
            agentId: '0acf531f-620a-470b-a15a-004616285138',
            name: 'New Widget',
            enabled: true,
            position: 'bottom-right',
            theme: 'light',
            buttonText: 'Chat',
            buttonIcon: 'chat',
            primaryColor: '#000000',
            allowedDomains: ['example.com']
          }
        }
      })

      expect(data).toHaveProperty(
        'data.luminaAgentWidgetCreate.message',
        'User is not a member of the team'
      )
    })

    it('should reject if input is invalid', async () => {
      const data = await authClient({
        document: CREATE_WIDGET_MUTATION,
        variables: {
          input: {
            agentId: 'zzz',
            name: '',
            enabled: true,
            position: 'bottom-right',
            theme: 'light',
            buttonText: 'Chat',
            buttonIcon: 'chat',
            primaryColor: '#000000',
            allowedDomains: ['']
          }
        }
      })

      expect(data).toHaveProperty('data.luminaAgentWidgetCreate.fieldErrors', [
        {
          message: 'Agent ID must be a valid UUID',
          path: ['input', 'agentId']
        },
        {
          message: 'Name is required',
          path: ['input', 'name']
        },
        {
          message: 'Allowed domain is required',
          path: ['input', 'allowedDomains', '0']
        }
      ])
    })
  })

  describe('luminaAgentWidgetUpdate', () => {
    it('should update widget', async () => {
      const widget: Widget & {
        agent: Agent & { team: Team & { members: TeamMember[] } }
      } = {
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
      prismaMock.widget.findUnique.mockResolvedValue(widget)

      prismaMock.widget.update.mockResolvedValue({
        id: 'widgetId',
        agentId: 'agentId',
        name: 'Updated Widget',
        enabled: false,
        position: 'bottom-right',
        theme: 'light',
        buttonText: 'Chat',
        buttonIcon: 'chat',
        primaryColor: '#000000',
        allowedDomains: ['example.com'],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      })

      const data = await authClient({
        document: UPDATE_WIDGET_MUTATION,
        variables: {
          id: 'widgetId',
          input: {
            name: 'Updated Widget',
            enabled: false,
            position: 'bottom-right',
            theme: 'light',
            buttonText: 'Chat',
            buttonIcon: 'chat',
            primaryColor: '#000000',
            allowedDomains: ['example.com']
          }
        }
      })

      expect(data).toHaveProperty('data.luminaAgentWidgetUpdate.data', {
        id: 'widgetId',
        name: 'Updated Widget',
        enabled: false,
        position: 'bottom-right',
        theme: 'light',
        buttonText: 'Chat',
        buttonIcon: 'chat',
        primaryColor: '#000000',
        allowedDomains: ['example.com'],
        createdAt: new Date('2024-01-01').toISOString(),
        updatedAt: new Date('2024-01-01').toISOString()
      })
    })

    it('should keep existing values if not provided', async () => {
      const widget: Widget & {
        agent: Agent & { team: Team & { members: TeamMember[] } }
      } = {
        id: 'widgetId',
        agentId: 'agentId',
        name: 'Test Widget',
        enabled: true,
        position: 'top-left',
        theme: 'dark',
        buttonText: 'Chat with AI',
        buttonIcon: 'chat-bubble-left-right',
        primaryColor: '#000000',
        allowedDomains: ['example.com'],
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
      prismaMock.widget.findUnique.mockResolvedValue(widget)

      prismaMock.widget.update.mockResolvedValue({
        id: 'widgetId',
        agentId: 'agentId',
        name: 'Updated Widget',
        enabled: false,
        position: 'bottom-right',
        theme: 'light',
        buttonText: 'Chat',
        buttonIcon: 'chat',
        primaryColor: '#000000',
        allowedDomains: ['example.com'],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      })

      const data = await authClient({
        document: UPDATE_WIDGET_MUTATION,
        variables: {
          id: 'widgetId',
          input: {
            position: 'bottom-right',
            theme: 'light',
            buttonText: 'Chat',
            buttonIcon: 'chat',
            primaryColor: '#000000'
          }
        }
      })

      expect(data).toHaveProperty('data.luminaAgentWidgetUpdate.data', {
        id: 'widgetId',
        name: 'Updated Widget',
        enabled: false,
        position: 'bottom-right',
        theme: 'light',
        buttonText: 'Chat',
        buttonIcon: 'chat',
        primaryColor: '#000000',
        allowedDomains: ['example.com'],
        createdAt: new Date('2024-01-01').toISOString(),
        updatedAt: new Date('2024-01-01').toISOString()
      })
    })

    it('should reject if widget not found', async () => {
      prismaMock.widget.findUnique.mockResolvedValue(null)

      const data = await authClient({
        document: UPDATE_WIDGET_MUTATION,
        variables: {
          id: 'widgetId',
          input: {
            name: 'Updated Widget',
            enabled: false,
            position: 'bottom-right',
            theme: 'light',
            buttonText: 'Chat',
            buttonIcon: 'chat',
            primaryColor: '#000000',
            allowedDomains: ['example.com']
          }
        }
      })

      expect(data).toHaveProperty(
        'data.luminaAgentWidgetUpdate.message',
        'Widget not found'
      )
    })

    it('should reject if user is not widget member', async () => {
      const widget: Widget & {
        agent: Agent & { team: Team & { members: TeamMember[] } }
      } = {
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
      prismaMock.widget.findUnique.mockResolvedValue(widget)

      const data = await authClient({
        document: UPDATE_WIDGET_MUTATION,
        variables: {
          id: 'widgetId',
          input: {
            name: 'Updated Widget',
            enabled: false,
            position: 'bottom-right',
            theme: 'light',
            buttonText: 'Chat',
            buttonIcon: 'chat',
            primaryColor: '#000000',
            allowedDomains: ['example.com']
          }
        }
      })

      expect(data).toHaveProperty(
        'data.luminaAgentWidgetUpdate.message',
        'User is not a member of the team'
      )
    })

    it('should reject if input is invalid', async () => {
      const data = await authClient({
        document: UPDATE_WIDGET_MUTATION,
        variables: {
          id: 'widgetId',
          input: {
            name: '',
            allowedDomains: []
          }
        }
      })

      expect(data).toHaveProperty('data.luminaAgentWidgetUpdate.fieldErrors', [
        {
          message: 'Name is required',
          path: ['input', 'name']
        },
        {
          message: 'Allowed domains are required',
          path: ['input', 'allowedDomains']
        }
      ])
    })
  })

  describe('luminaAgentWidgetDelete', () => {
    it('should delete widget', async () => {
      const widget: Widget & {
        agent: Agent & { team: Team & { members: TeamMember[] } }
      } = {
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
      prismaMock.widget.findUnique.mockResolvedValue(widget)

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

    it('should reject if widget not found', async () => {
      prismaMock.widget.findUnique.mockResolvedValue(null)

      const data = await authClient({
        document: DELETE_WIDGET_MUTATION,
        variables: { id: 'widgetId' }
      })

      expect(data).toHaveProperty(
        'data.luminaAgentWidgetDelete.message',
        'Widget not found'
      )
    })

    it('should reject if user is not widget member', async () => {
      const widget: Widget & {
        agent: Agent & { team: Team & { members: TeamMember[] } }
      } = {
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
      prismaMock.widget.findUnique.mockResolvedValue(widget)

      const data = await authClient({
        document: DELETE_WIDGET_MUTATION,
        variables: { id: 'widgetId' }
      })

      expect(data).toHaveProperty(
        'data.luminaAgentWidgetDelete.message',
        'User is not a member of the team'
      )
    })
  })
})
