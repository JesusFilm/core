import { graphql } from '@core/shared/gql'

import { stripe } from '../../../../lib/stripe'
import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'

const stripeMock = stripe as {
  customers: {
    create: jest.MockedFunction<any>
    update: jest.MockedFunction<any>
  }
}

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

  const UPDATE_PLAN_MUTATION = graphql(`
    mutation UpdatePlan($input: LuminaTeamPlanUpdateInput!) {
      luminaTeamPlanUpdate(input: $input) {
        ... on MutationLuminaTeamPlanUpdateSuccess {
          data {
            id
            billingEmail
            billingName
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

  beforeEach(() => {
    stripeMock.customers.create.mockResolvedValue({ id: 'cus_test123' })
    stripeMock.customers.update.mockResolvedValue({ id: 'cus_test123' })
  })

  describe('luminaTeamPlanCreate', () => {
    it('should create plan as owner', async () => {
      prismaMock.team.findUnique.mockResolvedValue({
        id: 'teamId',
        members: [
          {
            id: 'memberId',
            userId: 'testUserId',
            role: 'OWNER'
          }
        ]
      })

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
            teamId: 'teamId',
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
        billingName: 'Test Company'
      })
    })

    it('should reject if team not found', async () => {
      prismaMock.team.findUnique.mockResolvedValue(null)

      const data = await authClient({
        document: CREATE_PLAN_MUTATION,
        variables: {
          input: {
            teamId: 'nonExistentId',
            billingEmail: 'billing@example.com',
            billingName: 'Test Company'
          }
        }
      })

      expect(data).toHaveProperty('data.luminaTeamPlanCreate.message', 'Team not found')
    })

    it('should reject if user is not owner or manager', async () => {
      prismaMock.team.findUnique.mockResolvedValue({
        id: 'teamId',
        members: [
          {
            id: 'memberId',
            userId: 'testUserId',
            role: 'MEMBER'
          }
        ]
      })

      const data = await authClient({
        document: CREATE_PLAN_MUTATION,
        variables: {
          input: {
            teamId: 'teamId',
            billingEmail: 'billing@example.com',
            billingName: 'Test Company'
          }
        }
      })

      expect(data).toHaveProperty('data.luminaTeamPlanCreate.message', 'You are not an owner or manager of the team')
    })
  })

  describe('luminaTeamPlanUpdate', () => {
    it('should update plan', async () => {
      prismaMock.teamPlan.findUnique.mockResolvedValue({
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

      prismaMock.teamPlan.update.mockResolvedValue({
        id: 'planId',
        teamId: 'teamId',
        stripeCustomerId: 'cus_test123',
        stripeSubscriptionId: null,
        enabled: true,
        billingEmail: 'updated@example.com',
        billingName: 'Updated Company',
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
            teamId: 'teamId',
            billingEmail: 'updated@example.com',
            billingName: 'Updated Company'
          }
        }
      })

      expect(stripeMock.customers.update).toHaveBeenCalled()
      expect(data).toHaveProperty('data.luminaTeamPlanUpdate.data', {
        id: 'planId',
        billingEmail: 'updated@example.com',
        billingName: 'Updated Company'
      })
    })

    it('should reject if plan not found', async () => {
      prismaMock.teamPlan.findUnique.mockResolvedValue(null)

      const data = await authClient({
        document: UPDATE_PLAN_MUTATION,
        variables: {
          input: {
            teamId: 'teamId',
            billingEmail: 'updated@example.com'
          }
        }
      })

      expect(data).toHaveProperty('data.luminaTeamPlanUpdate.message', 'Team plan not found')
    })
  })
})

