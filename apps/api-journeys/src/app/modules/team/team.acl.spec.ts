import { subject } from '@casl/ability'
import { Test, TestingModule } from '@nestjs/testing'

import { Team, UserTeamRole } from '.prisma/api-journeys-client'

import { Action, AppAbility, AppCaslFactory } from '../../lib/casl/caslFactory'

describe('teamAcl', () => {
  let factory: AppCaslFactory, ability: AppAbility
  const user = { id: 'userId' }
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppCaslFactory]
    }).compile()
    factory = module.get<AppCaslFactory>(AppCaslFactory)
    ability = await factory.createAbility(user)
  })
  const teamUserTeamManager = subject('Team', {
    id: 'teamId',
    userTeams: [{ userId: user.id, role: UserTeamRole.manager }]
  } as unknown as Team)
  const teamUserTeamMember = subject('Team', {
    id: 'teamId',
    userTeams: [{ userId: user.id, role: UserTeamRole.member }]
  } as unknown as Team)
  const teamEmpty = subject('Team', { id: 'teamId' } as unknown as Team)
  describe('create', () => {
    it('allow for all users', () => {
      expect(ability.can(Action.Create, 'Team')).toEqual(true)
    })
  })
  describe('read', () => {
    it('allow when user is team manager', () => {
      expect(ability.can(Action.Read, teamUserTeamManager)).toEqual(true)
    })
    it('allow when user is team member', () => {
      expect(ability.can(Action.Read, teamUserTeamMember)).toEqual(true)
    })
    it('deny when user has no userTeam', () => {
      expect(ability.can(Action.Read, teamEmpty)).toEqual(false)
    })
  })
  describe('manage', () => {
    it('allow when user is team manager', () => {
      expect(ability.can(Action.Manage, teamUserTeamManager)).toEqual(true)
    })
    it('deny when user is team member', () => {
      expect(ability.can(Action.Manage, teamUserTeamMember)).toEqual(false)
    })
    it('deny when user has no userTeam', () => {
      expect(ability.can(Action.Manage, teamEmpty)).toEqual(false)
    })
  })
})
