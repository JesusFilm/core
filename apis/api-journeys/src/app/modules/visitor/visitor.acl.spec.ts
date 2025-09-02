import { subject } from '@casl/ability'
import { Test, TestingModule } from '@nestjs/testing'

import {
  UserJourneyRole,
  UserTeamRole,
  Visitor
} from '@core/prisma/journeys/client'

import { Action, AppAbility, AppCaslFactory } from '../../lib/casl/caslFactory'

describe('visitorAcl', () => {
  let factory: AppCaslFactory, ability: AppAbility
  const user = { id: 'userId' }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppCaslFactory]
    }).compile()
    factory = module.get<AppCaslFactory>(AppCaslFactory)
    ability = await factory.createAbility(user)
  })

  const visitorUserTeamManager = subject('Visitor', {
    id: 'visitorId',
    team: {
      userTeams: [{ userId: user.id, role: UserTeamRole.manager }]
    }
  } as unknown as Visitor)
  const visitorUserTeamMember = subject('Visitor', {
    id: 'visitorId',
    team: {
      userTeams: [{ userId: user.id, role: UserTeamRole.member }]
    }
  } as unknown as Visitor)
  const visitorUserJourneyOwner = subject('Visitor', {
    id: 'visitorId',
    journeyVisitors: [
      {
        journey: {
          userJourneys: [
            {
              userId: user.id,
              role: UserJourneyRole.owner
            }
          ]
        }
      }
    ]
  } as unknown as Visitor)
  const visitorUserJourneyEditor = subject('Visitor', {
    id: 'visitorId',
    journeyVisitors: [
      {
        journey: {
          userJourneys: [
            {
              userId: user.id,
              role: UserJourneyRole.editor
            }
          ]
        }
      }
    ]
  } as unknown as Visitor)
  const visitorEmpty = subject('Visitor', {
    id: 'visitorId',
    journeyVisitors: [
      {
        journey: {
          userJourneys: []
        }
      }
    ],
    team: { userTeams: [] }
  } as unknown as Visitor)
  const visitorUser = subject('Visitor', {
    id: 'visitorId',
    userId: user.id
  } as unknown as Visitor)

  describe('manage', () => {
    it('allow when user is team manager', () => {
      expect(ability.can(Action.Manage, visitorUserTeamManager)).toBe(true)
    })

    it('allow when user is journey owner', () => {
      expect(ability.can(Action.Manage, visitorUserJourneyOwner)).toBe(true)
    })

    it('allow when user is team member', () => {
      expect(ability.can(Action.Manage, visitorUserTeamMember)).toBe(true)
    })

    it('allow when user is journey editor', () => {
      expect(ability.can(Action.Manage, visitorUserJourneyEditor)).toBe(true)
    })

    it('allow when user is visitor', () => {
      expect(ability.can(Action.Manage, visitorUser)).toBe(true)
    })

    it('deny when user has no userTeam or relevant journey', () => {
      expect(ability.can(Action.Create, visitorEmpty)).toBe(false)
    })
  })
})
