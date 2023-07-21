import { Test, TestingModule } from '@nestjs/testing'
import { subject } from '@casl/ability'
import {
  UserTeamRole,
  UserTeam,
  UserTeamInvite,
  Host,
  Journey,
  JourneyVisitor,
  Visitor
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
    it('allow manage when user is team mananger', () => {
      expect(
        ability.can(
          Action.Manage,
          subject('Host', {
            id: 'hostId',
            team: {
              userTeams: [{ userId: user.id, role: UserTeamRole.manager }]
            }
          } as unknown as Host)
        )
      ).toEqual(true)
    })
  })
  describe('Journey', () => {
    it('allow create when user is team mananger', () => {
      expect(
        ability.can(
          Action.Create,
          subject('Journey', {
            id: 'hostId',
            team: {
              userTeams: [{ userId: user.id, role: UserTeamRole.manager }]
            }
          } as unknown as Journey)
        )
      ).toEqual(true)
    })
  })
  describe('JourneyVisitor', () => {
    it('should allow manage when visitor is user', () => {
      expect(
        ability.can(
          Action.Manage,
          subject('JourneyVisitor', {
            visitor: {
              userId: 'userId'
            }
          } as unknown as JourneyVisitor)
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
    it('should allow manage when user is team mananger', () => {
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
  describe('UserTeamInvite', () => {
    it('should allow manage when user is team mananger', () => {
      expect(
        ability.can(
          Action.Manage,
          subject('UserTeamInvite', {
            removedAt: null,
            acceptedAt: null,
            id: 'userTeamInviteId',
            team: {
              userTeams: [{ userId: user.id, role: UserTeamRole.manager }]
            }
          } as unknown as UserTeamInvite)
        )
      ).toEqual(true)
    })
  })
  describe('Visitor', () => {
    it('should allow manage when visitor is user', () => {
      expect(
        ability.can(
          Action.Manage,
          subject('Visitor', {
            userId: 'userId'
          } as unknown as Visitor)
        )
      ).toEqual(true)
    })
  })
})
