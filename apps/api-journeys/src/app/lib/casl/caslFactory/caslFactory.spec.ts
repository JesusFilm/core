import { Test, TestingModule } from '@nestjs/testing'
import { subject } from '@casl/ability'
import {
  UserTeamRole,
  UserTeam,
  Host,
  Journey
} from '.prisma/api-journeys-client'
import { Action, AppAbility, AppCaslFactory } from '.'

describe('AppCaslFactory', () => {
  let factory: AppCaslFactory, ability: AppAbility
  const user = { id: 'userId' }
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppCaslFactory]
    }).compile()
    factory = module.get<AppCaslFactory>(AppCaslFactory)
    ability = await factory.createAbility(user)
  })
  describe('Host', () => {
    it('should allow manage', () => {
      expect(
        ability.can(
          Action.Manage,
          subject('Host', {
            id: 'hostId',
            team: {
              userTeams: [{ userId: user.id }]
            }
          } as unknown as Host)
        )
      ).toEqual(true)
    })
  })
  describe('Journey', () => {
    it('should allow create', () => {
      expect(
        ability.can(
          Action.Create,
          subject('Journey', {
            id: 'hostId',
            team: {
              userTeams: [{ userId: user.id }]
            }
          } as unknown as Journey)
        )
      ).toEqual(true)
    })
  })
  describe('Team', () => {
    it('should allow create', () => {
      expect(ability.can(Action.Create, 'Team')).toEqual(true)
    })
  })
  describe('UserTeam', () => {
    it('should allow manage', () => {
      expect(
        ability.can(
          Action.Manage,
          subject('UserTeam', {
            id: 'userTeamId',
            team: {
              userTeams: [{ userId: user.id, role: UserTeamRole.manager }]
            }
          } as unknown as UserTeam)
        )
      ).toEqual(true)
    })
  })
})
