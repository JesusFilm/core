import { TeamPlan } from '@core/prisma/lumina/client'
import { graphql } from '@core/shared/gql'

import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'

describe('team plan queries', () => {
  const authClient = getClient({
    headers: {
      authorization: 'token'
    }
  })

  const PLAN_QUERY = graphql(`
    query LuminaTeamPlan($teamId: ID!) {
      luminaTeamPlan(teamId: $teamId) {
        ... on QueryLuminaTeamPlanSuccess {
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
        ... on NotFoundError {
          message
        }
      }
    }
  `)

  describe('luminaTeamPlan', () => {
    it('should query team plan', async () => {
      const teamPlan: TeamPlan = {
        id: 'planId',
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
      }

      prismaMock.teamPlan.findUnique.mockResolvedValue(teamPlan)

      const data = await authClient({
        document: PLAN_QUERY,
        variables: { teamId: 'teamId' }
      })

      expect(data).toHaveProperty('data.luminaTeamPlan.data', {
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
        enabled: true,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        createdAt: new Date('2024-01-01').toISOString(),
        updatedAt: new Date('2024-01-01').toISOString()
      })
    })

    it('should return NotFoundError when plan not found', async () => {
      prismaMock.teamPlan.findUnique.mockResolvedValue(null)

      const data = await authClient({
        document: PLAN_QUERY,
        variables: { teamId: 'teamId' }
      })

      expect(data).toHaveProperty(
        'data.luminaTeamPlan.message',
        'Team plan not found'
      )
    })
  })
})
