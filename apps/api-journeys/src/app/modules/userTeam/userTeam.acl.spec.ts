import { Test, TestingModule } from '@nestjs/testing'
import { subject } from '@casl/ability'
import { UserTeamRole, UserTeam } from '.prisma/api-journeys-client'
import { Action, AppAbility, AppCaslFactory } from '../../lib/casl/caslFactory'

describe('userTeamAcl', () => {
  let factory: AppCaslFactory, ability: AppAbility
  const user = { id: 'userId' }
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppCaslFactory]
    }).compile()
    factory = module.get<AppCaslFactory>(AppCaslFactory)
    ability = await factory.createAbility(user)
  })
  const userTeamUserTeamManager = subject('UserTeam', {
    id: 'userTeamId',
    team: {
      userTeams: [{ userId: user.id, role: UserTeamRole.manager }]
    }
  } as unknown as UserTeam)
  const userTeamUserTeamMember = subject('UserTeam', {
    id: 'userTeamId',
    team: {
      userTeams: [{ userId: user.id, role: UserTeamRole.member }]
    }
  } as unknown as UserTeam)
  const userTeamEmpty = subject('UserTeam', {
    id: 'userTeamId'
  } as unknown as UserTeam)
  describe('read', () => {
    it('allow when user is team manager', () => {
      expect(ability.can(Action.Read, userTeamUserTeamManager)).toEqual(true)
    })
    it('allow when user is team member', () => {
      expect(ability.can(Action.Read, userTeamUserTeamMember)).toEqual(true)
    })
    it('deny when user has no userTeam', () => {
      expect(ability.can(Action.Read, userTeamEmpty)).toEqual(false)
    })
  })
  describe('manage', () => {
    it('allow when user is team manager', () => {
      expect(ability.can(Action.Manage, userTeamUserTeamManager)).toEqual(true)
    })
    it('deny when user is team member', () => {
      expect(ability.can(Action.Manage, userTeamUserTeamMember)).toEqual(false)
    })
    it('deny when user has no userTeam', () => {
      expect(ability.can(Action.Manage, userTeamEmpty)).toEqual(false)
    })
  })
})
