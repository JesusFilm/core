import { subject } from '@casl/ability'
import { Test, TestingModule } from '@nestjs/testing'

import {
  JourneyVisitor,
  UserJourneyRole,
  UserTeamRole
} from '@core/prisma/journeys/client'

import { Action, AppAbility, AppCaslFactory } from '../../lib/casl/caslFactory'

describe('journeyVisitorAcl', () => {
  let factory: AppCaslFactory, ability: AppAbility
  const user = { id: 'userId' }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppCaslFactory]
    }).compile()
    factory = module.get<AppCaslFactory>(AppCaslFactory)
    ability = await factory.createAbility(user)
  })

  const journeyVisitorUserTeamManager = subject('JourneyVisitor', {
    id: 'visitorId',
    visitor: {
      team: {
        userTeams: [{ userId: user.id, role: UserTeamRole.manager }]
      }
    }
  } as unknown as JourneyVisitor)
  const journeyVisitorUserTeamMember = subject('JourneyVisitor', {
    id: 'visitorId',
    visitor: {
      team: {
        userTeams: [{ userId: user.id, role: UserTeamRole.member }]
      }
    }
  } as unknown as JourneyVisitor)
  const journeyVisitorUserJourneyOwner = subject('JourneyVisitor', {
    id: 'visitorId',
    journey: {
      userJourneys: [
        {
          userId: user.id,
          role: UserJourneyRole.owner
        }
      ]
    }
  } as unknown as JourneyVisitor)
  const journeyVisitorUserJourneyEditor = subject('JourneyVisitor', {
    id: 'visitorId',
    journey: {
      userJourneys: [
        {
          userId: user.id,
          role: UserJourneyRole.editor
        }
      ]
    }
  } as unknown as JourneyVisitor)
  const journeyVisitorEmpty = subject('JourneyVisitor', {
    id: 'visitorId',
    journey: {
      userJourneys: []
    },
    visitor: {
      team: { userTeams: [] }
    }
  } as unknown as JourneyVisitor)
  const journeyVisitorUser = subject('JourneyVisitor', {
    id: 'visitorId',
    visitor: {
      userId: user.id
    }
  } as unknown as JourneyVisitor)

  describe('manage', () => {
    it('allow when user is team manager', () => {
      expect(ability.can(Action.Manage, journeyVisitorUserTeamManager)).toBe(
        true
      )
    })

    it('allow when user is journey owner', () => {
      expect(ability.can(Action.Manage, journeyVisitorUserJourneyOwner)).toBe(
        true
      )
    })

    it('allow when user is team member', () => {
      expect(ability.can(Action.Manage, journeyVisitorUserTeamMember)).toBe(
        true
      )
    })

    it('allow when user is journey editor', () => {
      expect(ability.can(Action.Manage, journeyVisitorUserJourneyEditor)).toBe(
        true
      )
    })

    it('allow when user is visitor', () => {
      expect(ability.can(Action.Manage, journeyVisitorUser)).toBe(true)
    })

    it('deny when user has no userTeam or relevant journey', () => {
      expect(ability.can(Action.Create, journeyVisitorEmpty)).toBe(false)
    })
  })
})
