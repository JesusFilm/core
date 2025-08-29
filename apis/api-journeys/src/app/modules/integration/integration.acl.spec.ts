import { subject } from '@casl/ability'
import { Test, TestingModule } from '@nestjs/testing'

import { Integration } from '@core/prisma/journeys/client'

import { UserTeamRole } from '../../__generated__/graphql'
import { Action, AppAbility, AppCaslFactory } from '../../lib/casl/caslFactory'

describe('integrationAcl', () => {
  let factory: AppCaslFactory, ability: AppAbility
  const user = { id: 'userId' }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppCaslFactory]
    }).compile()
    factory = module.get<AppCaslFactory>(AppCaslFactory)
    ability = await factory.createAbility(user)
  })

  const integrationUserTeamManager = subject('Integration', {
    id: 'integrationId',
    team: {
      userTeams: [{ userId: user.id, role: UserTeamRole.manager }]
    }
  } as unknown as Integration)

  const integrationUserTeamMember = subject('Integration', {
    id: 'integrationId',
    team: {
      userTeams: [{ userId: user.id, role: UserTeamRole.member }]
    }
  } as unknown as Integration)

  const integrationEmpty = subject('Integration', {
    id: 'integrationId'
  } as unknown as Integration)

  describe('manage', () => {
    it('allow when user is team manager', () => {
      expect(ability.can(Action.Manage, integrationUserTeamManager)).toBe(true)
    })

    it('allow when user is team member', () => {
      expect(ability.can(Action.Manage, integrationUserTeamMember)).toBe(true)
    })

    it('deny when user has no userTeam', () => {
      expect(ability.can(Action.Manage, integrationEmpty)).toBe(false)
    })
  })
})
