import { subject } from '@casl/ability'
import { Test, TestingModule } from '@nestjs/testing'

import {
  Host,
  Integration,
  Journey,
  JourneyNotification,
  JourneyVisitor,
  UserInvite,
  UserTeam,
  UserTeamInvite,
  UserTeamRole,
  Visitor
} from '@core/prisma/journeys/client'

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
    it('allow manage when user is team manager', () => {
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
      ).toBe(true)
    })
  })

  describe('Integration', () => {
    it('allow manage when user is team manager', () => {
      expect(
        ability.can(
          Action.Manage,
          subject('Integration', {
            id: 'integrationId',
            team: {
              userTeams: [{ userId: user.id, role: UserTeamRole.manager }]
            }
          } as unknown as Integration)
        )
      ).toBe(true)
    })
  })

  describe('JourneyNotification', () => {
    it('allow manage when user is the same journey notification user in userTeam', () => {
      expect(
        ability.can(
          Action.Manage,
          subject('JourneyNotification', {
            id: 'journeyNotificationId',
            userId: user.id,
            userTeam: { userId: user.id }
          } as unknown as JourneyNotification)
        )
      ).toBe(true)
    })

    it('allow manage when user is the same journey notification user in userJourney', () => {
      expect(
        ability.can(
          Action.Manage,
          subject('JourneyNotification', {
            id: 'journeyNotificationId',
            userId: user.id,
            userJourney: { userId: user.id }
          } as unknown as JourneyNotification)
        )
      ).toBe(true)
    })
  })

  describe('Journey', () => {
    it('allow create when user is team manager', () => {
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
      ).toBe(true)
    })
  })

  describe('JourneyVisitor', () => {
    it('allow manage when visitor is user', () => {
      expect(
        ability.can(
          Action.Manage,
          subject('JourneyVisitor', {
            visitor: {
              userId: 'userId'
            }
          } as unknown as JourneyVisitor)
        )
      ).toBe(true)
    })
  })

  describe('Team', () => {
    it('allow create', () => {
      expect(ability.can(Action.Create, 'Team')).toBe(true)
    })
  })

  describe('UserInvite', () => {
    it('allow manage when user is team manager', () => {
      expect(
        ability.can(
          Action.Manage,
          subject('UserInvite', {
            removedAt: null,
            acceptedAt: null,
            id: 'userInviteId',
            journey: {
              team: {
                userTeams: [{ userId: user.id, role: UserTeamRole.member }]
              }
            }
          } as unknown as UserInvite)
        )
      ).toBe(true)
    })
  })

  describe('UserTeam', () => {
    it('allow manage when user is team manager', () => {
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
      ).toBe(true)
    })
  })

  describe('UserTeamInvite', () => {
    it('allow manage when user is team manager', () => {
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
      ).toBe(true)
    })
  })

  describe('Visitor', () => {
    it('allow manage when visitor is user', () => {
      expect(
        ability.can(
          Action.Manage,
          subject('Visitor', {
            userId: 'userId'
          } as unknown as Visitor)
        )
      ).toBe(true)
    })
  })
})
