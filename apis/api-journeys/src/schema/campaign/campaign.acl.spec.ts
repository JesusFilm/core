import { UserTeamRole } from '@core/prisma/journeys/client'
import { User } from '@core/yoga/firebaseClient'

import { Action, campaignAcl } from './campaign.acl'

describe('campaignAcl', () => {
  const user = { id: 'userId' } as unknown as User

  function campaignFor(role: UserTeamRole, userId = user.id) {
    return {
      team: {
        userTeams: [
          {
            id: 'userTeamId',
            teamId: 'teamId',
            userId,
            role,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]
      }
    }
  }

  const everyAction = Object.values(Action)

  describe.each([
    ['member', UserTeamRole.member],
    ['manager', UserTeamRole.manager]
  ] as const)('a %s of the team', (_label, role) => {
    it.each([Action.Create, Action.Read, Action.Update])(
      'passes %s',
      (action) => {
        expect(campaignAcl(action, campaignFor(role), user)).toBe(true)
      }
    )
  })

  it.each([Action.Manage, Action.Delete])(
    '%s passes for a manager only',
    (action) => {
      expect(campaignAcl(action, campaignFor(UserTeamRole.manager), user)).toBe(
        true
      )
      expect(campaignAcl(action, campaignFor(UserTeamRole.member), user)).toBe(
        false
      )
    }
  )

  it.each(everyAction)('denies %s to a user outside the team', (action) => {
    expect(
      campaignAcl(action, campaignFor(UserTeamRole.manager, 'other'), user)
    ).toBe(false)
  })

  it.each(everyAction)(
    'denies %s when the team has no members at all',
    (action) => {
      expect(campaignAcl(action, { team: { userTeams: [] } }, user)).toBe(false)
    }
  )
})
