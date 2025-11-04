import { Team, TeamMember, TeamPlan } from '@core/prisma/lumina/client'
import { graphql } from '@core/shared/gql'

import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'
import { stripeMock } from '../../../../test/stripeMock'
import { TWO_CHAR_COUNTRY_CODES } from '../../../lib/twoCharCountryCodes'

jest.mock('crypto', () => ({
  ...jest.requireActual('crypto'),
  randomUUID: jest.fn().mockReturnValue('newPlanId')
}))

describe('team plan mutations', () => {
  const authClient = getClient({
    headers: {
      authorization: 'token'
    }
  })

  const CREATE_PLAN_MUTATION = graphql(`
    mutation CreatePlan($input: LuminaTeamPlanCreateInput!) {
      luminaTeamPlanCreate(input: $input) {
        ... on MutationLuminaTeamPlanCreateSuccess {
          data {
            id
            teamId
            billingEmail
            billingName
            billingAddressCity
            billingAddressCountry
            billingAddressLine1
            billingAddressLine2
            billingAddressPostalCode
            billingAddressState
            enabled
            currentPeriodEnd
            cancelAtPeriodEnd
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
          message
        }
      }
    }
  `)

  const UPDATE_PLAN_MUTATION = graphql(`
    mutation UpdatePlan($input: LuminaTeamPlanUpdateInput!) {
      luminaTeamPlanUpdate(input: $input) {
        ... on MutationLuminaTeamPlanUpdateSuccess {
          data {
            id
            billingEmail
            billingName
            billingAddressCity
            billingAddressCountry
            billingAddressLine1
            billingAddressLine2
            billingAddressPostalCode
            billingAddressState
            enabled
            currentPeriodEnd
            cancelAtPeriodEnd
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
          message
        }
      }
    }
  `)

  beforeEach(() => {
    stripeMock.customers.create.mockResolvedValue({
      id: 'cus_test123'
    } as any)
    stripeMock.customers.update.mockResolvedValue({
      id: 'cus_test123'
    } as any)
  })

  describe('luminaTeamPlanCreate', () => {
    it('should create plan as owner', async () => {
      const team: Team & { members: TeamMember[] } = {
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

      prismaMock.team.findUnique.mockResolvedValue(team)

      prismaMock.teamPlan.create.mockResolvedValue({
        id: 'newPlanId',
        teamId: 'teamId',
        stripeCustomerId: 'cus_test123',
        stripeSubscriptionId: null,
        enabled: true,
        billingEmail: 'billing@example.com',
        billingName: 'Test Company',
        billingAddressCity: 'New York',
        billingAddressCountry: 'US',
        billingAddressLine1: '123 Main St',
        billingAddressLine2: 'Apt 4B',
        billingAddressPostalCode: '10001',
        billingAddressState: 'NY',
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      })

      const data = await authClient({
        document: CREATE_PLAN_MUTATION,
        variables: {
          input: {
            teamId: '9f2c2d38-5c91-47b3-8a9b-63a472a6ffb1',
            billingEmail: 'billing@example.com',
            billingName: 'Test Company',
            billingAddressCity: 'New York',
            billingAddressCountry: 'US',
            billingAddressLine1: '123 Main St',
            billingAddressLine2: 'Apt 4B',
            billingAddressPostalCode: '10001',
            billingAddressState: 'NY'
          }
        }
      })

      expect(stripeMock.customers.create).toHaveBeenCalled()

      expect(data).toHaveProperty('data.luminaTeamPlanCreate.data', {
        id: 'newPlanId',
        teamId: 'teamId',
        billingEmail: 'billing@example.com',
        billingName: 'Test Company',
        billingAddressCity: 'New York',
        billingAddressCountry: 'US',
        billingAddressLine1: '123 Main St',
        billingAddressLine2: 'Apt 4B',
        billingAddressPostalCode: '10001',
        billingAddressState: 'NY',
        enabled: true,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        createdAt: new Date('2024-01-01').toISOString(),
        updatedAt: new Date('2024-01-01').toISOString()
      })
    })

    it('should create with missing billing address fields', async () => {
      const team: Team & { members: TeamMember[] } = {
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

      prismaMock.team.findUnique.mockResolvedValue(team)

      prismaMock.teamPlan.create.mockResolvedValue({
        id: 'newPlanId',
        teamId: 'teamId',
        stripeCustomerId: 'cus_test123',
        stripeSubscriptionId: null,
        enabled: true,
        billingEmail: 'billing@example.com',
        billingName: 'Test Company',
        billingAddressCity: null,
        billingAddressCountry: null,
        billingAddressLine1: null,
        billingAddressLine2: null,
        billingAddressPostalCode: null,
        billingAddressState: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      })
      const data = await authClient({
        document: CREATE_PLAN_MUTATION,
        variables: {
          input: {
            teamId: '9f2c2d38-5c91-47b3-8a9b-63a472a6ffb1',
            billingEmail: 'billing@example.com',
            billingName: 'Test Company'
          }
        }
      })
      expect(stripeMock.customers.create).toHaveBeenCalled()

      expect(data).toHaveProperty('data.luminaTeamPlanCreate.data', {
        id: 'newPlanId',
        teamId: 'teamId',
        billingEmail: 'billing@example.com',
        billingName: 'Test Company',
        billingAddressCity: null,
        billingAddressCountry: null,
        billingAddressLine1: null,
        billingAddressLine2: null,
        billingAddressPostalCode: null,
        billingAddressState: null,
        enabled: true,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        createdAt: new Date('2024-01-01').toISOString(),
        updatedAt: new Date('2024-01-01').toISOString()
      })
    })

    it('should reject if team not found', async () => {
      prismaMock.team.findUnique.mockResolvedValue(null)

      const data = await authClient({
        document: CREATE_PLAN_MUTATION,
        variables: {
          input: {
            teamId: '9f2c2d38-5c91-47b3-8a9b-63a472a6ffb1',
            billingEmail: 'billing@example.com',
            billingName: 'Test Company'
          }
        }
      })

      expect(data).toHaveProperty(
        'data.luminaTeamPlanCreate.message',
        'Team not found'
      )
    })

    it('should reject if user is not owner or manager', async () => {
      const team: Team & { members: TeamMember[] } = {
        id: 'teamId',
        name: 'Test Team',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        members: [
          {
            id: 'memberId',
            teamId: 'teamId',
            userId: 'testUserId',
            role: 'MEMBER',
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01')
          }
        ]
      }

      prismaMock.team.findUnique.mockResolvedValue(team)

      const data = await authClient({
        document: CREATE_PLAN_MUTATION,
        variables: {
          input: {
            teamId: '9f2c2d38-5c91-47b3-8a9b-63a472a6ffb1',
            billingEmail: 'billing@example.com',
            billingName: 'Test Company'
          }
        }
      })

      expect(data).toHaveProperty(
        'data.luminaTeamPlanCreate.message',
        'You are not an owner or manager of the team'
      )
    })

    it('should reject if team id is not uuid', async () => {
      const data = await authClient({
        document: CREATE_PLAN_MUTATION,
        variables: {
          input: {
            teamId: 'invalid-team-id',
            billingEmail: 'billing@example.com',
            billingName: 'Test Company'
          }
        }
      })

      expect(data).toHaveProperty(
        'data.luminaTeamPlanCreate.message',
        JSON.stringify(
          [
            {
              validation: 'uuid',
              code: 'invalid_string',
              message: 'Team ID must be a valid UUID',
              path: ['input', 'teamId']
            }
          ],
          null,
          2
        )
      )
    })

    it('should reject if email is not valid', async () => {
      const data = await authClient({
        document: CREATE_PLAN_MUTATION,
        variables: {
          input: {
            teamId: '9f2c2d38-5c91-47b3-8a9b-63a472a6ffb1',
            billingEmail: 'invalid-email',
            billingName: 'Test Company'
          }
        }
      })

      expect(data).toHaveProperty(
        'data.luminaTeamPlanCreate.message',
        JSON.stringify(
          [
            {
              validation: 'email',
              code: 'invalid_string',
              message: 'Invalid email',
              path: ['input', 'billingEmail']
            }
          ],
          null,
          2
        )
      )
    })

    it('should reject if billing name is not provided', async () => {
      const data = await authClient({
        document: CREATE_PLAN_MUTATION,
        variables: {
          input: {
            teamId: '9f2c2d38-5c91-47b3-8a9b-63a472a6ffb1',
            billingEmail: 'billing@example.com',
            billingName: ''
          }
        }
      })

      expect(data).toHaveProperty(
        'data.luminaTeamPlanCreate.message',
        JSON.stringify(
          [
            {
              code: 'too_small',
              minimum: 1,
              type: 'string',
              inclusive: true,
              exact: false,
              message: 'Billing name is required',
              path: ['input', 'billingName']
            }
          ],
          null,
          2
        )
      )
    })

    it('should reject if billing address country is not valid', async () => {
      const data = await authClient({
        document: CREATE_PLAN_MUTATION,
        variables: {
          input: {
            teamId: '9f2c2d38-5c91-47b3-8a9b-63a472a6ffb1',
            billingEmail: 'billing@example.com',
            billingName: 'Test Company',
            billingAddressCountry: 'invalid-country'
          }
        }
      })

      expect(data).toHaveProperty(
        'data.luminaTeamPlanCreate.message',
        JSON.stringify(
          [
            {
              received: 'invalid-country',
              code: 'invalid_enum_value',
              options: TWO_CHAR_COUNTRY_CODES,
              path: ['input', 'billingAddressCountry'],
              message:
                'Billing address country must be a valid ISO 3166-1 alpha-2 code'
            }
          ],
          null,
          2
        )
      )
    })
  })

  describe('luminaTeamPlanUpdate', () => {
    it('should update plan', async () => {
      const teamPlan: TeamPlan & { team: Team & { members: TeamMember[] } } = {
        id: 'planId',
        teamId: 'teamId',
        billingEmail: 'billing@example.com',
        billingName: 'Test Company',
        billingAddressCity: null,
        billingAddressCountry: null,
        billingAddressLine1: null,
        billingAddressLine2: null,
        billingAddressPostalCode: null,
        billingAddressState: null,
        stripeCustomerId: 'cus_test123',
        stripeSubscriptionId: null,
        enabled: true,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
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
      } as TeamPlan & { team: Team & { members: TeamMember[] } }

      prismaMock.teamPlan.findUnique.mockResolvedValue(teamPlan)

      prismaMock.teamPlan.update.mockResolvedValue({
        id: 'planId',
        teamId: 'teamId',
        stripeCustomerId: 'cus_test123',
        stripeSubscriptionId: null,
        enabled: true,
        billingEmail: 'updated@example.com',
        billingName: 'Updated Company',
        billingAddressCity: 'New York',
        billingAddressCountry: 'US',
        billingAddressLine1: '123 Main St',
        billingAddressLine2: 'Apt 4B',
        billingAddressPostalCode: '10001',
        billingAddressState: 'NY',
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      })

      const data = await authClient({
        document: UPDATE_PLAN_MUTATION,
        variables: {
          input: {
            teamId: '9f2c2d38-5c91-47b3-8a9b-63a472a6ffb1',
            billingEmail: 'updated@example.com',
            billingName: 'Updated Company',
            billingAddressCity: 'New York',
            billingAddressCountry: 'US',
            billingAddressLine1: '123 Main St',
            billingAddressLine2: 'Apt 4B',
            billingAddressPostalCode: '10001',
            billingAddressState: 'NY'
          }
        }
      })

      expect(stripeMock.customers.update).toHaveBeenCalled()
      expect(data).toHaveProperty('data.luminaTeamPlanUpdate.data', {
        id: 'planId',
        billingEmail: 'updated@example.com',
        billingName: 'Updated Company',
        billingAddressCity: 'New York',
        billingAddressCountry: 'US',
        billingAddressLine1: '123 Main St',
        billingAddressLine2: 'Apt 4B',
        billingAddressPostalCode: '10001',
        billingAddressState: 'NY',
        enabled: true,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        createdAt: new Date('2024-01-01').toISOString(),
        updatedAt: new Date('2024-01-01').toISOString()
      })
    })

    it('should keep original values if not provided', async () => {
      const teamPlan: TeamPlan & { team: Team & { members: TeamMember[] } } = {
        id: 'planId',
        teamId: 'teamId',
        billingEmail: 'billing@example.com',
        billingName: 'Test Company',
        billingAddressCity: 'New York',
        billingAddressCountry: 'US',
        billingAddressLine1: '123 Main St',
        billingAddressLine2: 'Apt 4B',
        billingAddressPostalCode: '10001',
        billingAddressState: 'NY',
        stripeCustomerId: 'cus_test123',
        stripeSubscriptionId: null,
        enabled: true,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
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

      prismaMock.teamPlan.findUnique.mockResolvedValue(teamPlan)

      prismaMock.teamPlan.update.mockResolvedValue({
        id: 'planId',
        teamId: 'teamId',
        stripeCustomerId: 'cus_test123',
        stripeSubscriptionId: null,
        enabled: true,
        billingEmail: 'billing@example.com',
        billingName: 'Updated Company',
        billingAddressCity: 'New York',
        billingAddressCountry: 'US',
        billingAddressLine1: '123 Main St',
        billingAddressLine2: 'Apt 4B',
        billingAddressPostalCode: '10001',
        billingAddressState: 'NY',
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      })

      const data = await authClient({
        document: UPDATE_PLAN_MUTATION,
        variables: {
          input: {
            teamId: '9f2c2d38-5c91-47b3-8a9b-63a472a6ffb1',
            billingName: 'Updated Company'
          }
        }
      })

      expect(data).toHaveProperty('data.luminaTeamPlanUpdate.data', {
        id: 'planId',
        billingEmail: 'billing@example.com',
        billingName: 'Updated Company',
        billingAddressCity: 'New York',
        billingAddressCountry: 'US',
        billingAddressLine1: '123 Main St',
        billingAddressLine2: 'Apt 4B',
        billingAddressPostalCode: '10001',
        billingAddressState: 'NY',
        enabled: true,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        createdAt: new Date('2024-01-01').toISOString(),
        updatedAt: new Date('2024-01-01').toISOString()
      })
    })

    it('should keep undefined values if not provided', async () => {
      const teamPlan: TeamPlan & { team: Team & { members: TeamMember[] } } = {
        id: 'planId',
        teamId: 'teamId',
        billingEmail: 'billing@example.com',
        billingName: 'Test Company',
        billingAddressCity: null,
        billingAddressCountry: null,
        billingAddressLine1: null,
        billingAddressLine2: null,
        billingAddressPostalCode: null,
        billingAddressState: null,
        stripeCustomerId: 'cus_test123',
        stripeSubscriptionId: null,
        enabled: true,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
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

      prismaMock.teamPlan.findUnique.mockResolvedValue(teamPlan)

      prismaMock.teamPlan.update.mockResolvedValue({
        id: 'planId',
        teamId: 'teamId',
        stripeCustomerId: 'cus_test123',
        stripeSubscriptionId: null,
        enabled: true,
        billingEmail: 'updated@example.com',
        billingName: 'Test Company',
        billingAddressCity: null,
        billingAddressCountry: null,
        billingAddressLine1: null,
        billingAddressLine2: null,
        billingAddressPostalCode: null,
        billingAddressState: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      })

      const data = await authClient({
        document: UPDATE_PLAN_MUTATION,
        variables: {
          input: {
            teamId: '9f2c2d38-5c91-47b3-8a9b-63a472a6ffb1',
            billingEmail: 'updated@example.com'
          }
        }
      })

      expect(data).toHaveProperty('data.luminaTeamPlanUpdate.data', {
        id: 'planId',
        billingEmail: 'updated@example.com',
        billingName: 'Test Company',
        billingAddressCity: null,
        billingAddressCountry: null,
        billingAddressLine1: null,
        billingAddressLine2: null,
        billingAddressPostalCode: null,
        billingAddressState: null,
        enabled: true,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        createdAt: new Date('2024-01-01').toISOString(),
        updatedAt: new Date('2024-01-01').toISOString()
      })
    })

    it('should reject if plan not found', async () => {
      prismaMock.teamPlan.findUnique.mockResolvedValue(null)

      const data = await authClient({
        document: UPDATE_PLAN_MUTATION,
        variables: {
          input: {
            teamId: '9f2c2d38-5c91-47b3-8a9b-63a472a6ffb1',
            billingEmail: 'updated@example.com'
          }
        }
      })

      expect(data).toHaveProperty(
        'data.luminaTeamPlanUpdate.message',
        'Team plan not found'
      )
    })

    it('should reject if user is not owner or manager', async () => {
      const teamPlan: TeamPlan & { team: Team & { members: TeamMember[] } } = {
        id: 'planId',
        teamId: 'teamId',
        billingEmail: 'billing@example.com',
        billingName: 'Test Company',
        billingAddressCity: null,
        billingAddressCountry: null,
        billingAddressLine1: null,
        billingAddressLine2: null,
        billingAddressPostalCode: null,
        billingAddressState: null,
        stripeCustomerId: 'cus_test123',
        stripeSubscriptionId: null,
        enabled: true,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
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
              role: 'MEMBER',
              createdAt: new Date('2024-01-01'),
              updatedAt: new Date('2024-01-01')
            }
          ]
        }
      }

      prismaMock.teamPlan.findUnique.mockResolvedValue(teamPlan)

      const data = await authClient({
        document: UPDATE_PLAN_MUTATION,
        variables: {
          input: {
            teamId: '9f2c2d38-5c91-47b3-8a9b-63a472a6ffb1'
          }
        }
      })

      expect(data).toHaveProperty(
        'data.luminaTeamPlanUpdate.message',
        'You are not an owner or manager of the team'
      )
    })
  })
})
