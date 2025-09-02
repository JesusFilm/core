import { subject } from '@casl/ability'
import { Test, TestingModule } from '@nestjs/testing'

import { Host, UserTeamRole } from '@core/prisma/journeys/client'

import { Action, AppAbility, AppCaslFactory } from '../../lib/casl/caslFactory'

describe('hostAcl', () => {
  let factory: AppCaslFactory, ability: AppAbility
  const user = { id: 'userId' }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppCaslFactory]
    }).compile()
    factory = module.get<AppCaslFactory>(AppCaslFactory)
    ability = await factory.createAbility(user)
  })

  const hostUserTeamManager = subject('Host', {
    id: 'hostId',
    team: {
      userTeams: [{ userId: user.id, role: UserTeamRole.manager }]
    }
  } as unknown as Host)
  const hostUserTeamMember = subject('Host', {
    id: 'hostId',
    team: {
      userTeams: [{ userId: user.id, role: UserTeamRole.member }]
    }
  } as unknown as Host)
  const hostEmpty = subject('Host', {
    id: 'hostId'
  } as unknown as Host)

  describe('read', () => {
    it('allow when user is team manager', () => {
      expect(ability.can(Action.Read, hostUserTeamManager)).toBe(true)
    })

    it('allow when user is team member', () => {
      expect(ability.can(Action.Read, hostUserTeamMember)).toBe(true)
    })

    it('deny when user has no userTeam', () => {
      expect(ability.can(Action.Read, hostEmpty)).toBe(false)
    })
  })

  describe('manage', () => {
    it('allow when user is team manager', () => {
      expect(ability.can(Action.Manage, hostUserTeamManager)).toBe(true)
    })

    it('allow when user is team member', () => {
      expect(ability.can(Action.Manage, hostUserTeamMember)).toBe(true)
    })

    it('deny when user has no userTeam', () => {
      expect(ability.can(Action.Manage, hostEmpty)).toBe(false)
    })
  })
})
