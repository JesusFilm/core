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
      prismaMock.teamPlan.findUnique.mockResolvedValue({
        id: 'planId',
        teamId: 'teamId',
        billingEmail: 'billing@example.com',
        billingName: 'Test Company'
      })

      const data = await authClient({
        document: PLAN_QUERY,
        variables: { teamId: 'teamId' }
      })

      expect(data).toHaveProperty('data.luminaTeamPlan.data', {
        id: 'planId',
        teamId: 'teamId',
        billingEmail: 'billing@example.com',
        billingName: 'Test Company'
      })
    })

    it('should return NotFoundError when plan not found', async () => {
      prismaMock.teamPlan.findUnique.mockResolvedValue(null)

      const data = await authClient({
        document: PLAN_QUERY,
        variables: { teamId: 'teamId' }
      })

      expect(data).toHaveProperty('data.luminaTeamPlan.message', 'Team plan not found')
    })
  })
})

