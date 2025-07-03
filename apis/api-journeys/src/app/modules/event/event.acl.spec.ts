import { subject } from '@casl/ability'
import { Test, TestingModule } from '@nestjs/testing'

import {
  Event,
  UserJourneyRole,
  UserTeamRole
} from '.prisma/api-journeys-client'

import { Action, AppAbility, AppCaslFactory } from '../../lib/casl/caslFactory'

describe('eventAcl', () => {
  let factory: AppCaslFactory, ability: AppAbility
  const user = { id: 'userId' }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppCaslFactory]
    }).compile()
    factory = module.get<AppCaslFactory>(AppCaslFactory)
    ability = await factory.createAbility(user)
  })

  const eventUserTeamManager = subject('Event', {
    id: 'eventId',
    journey: {
      team: {
        userTeams: [{ userId: user.id, role: UserTeamRole.manager }]
      },
      userJourneys: []
    }
  } as unknown as Event)

  const eventUserTeamMember = subject('Event', {
    id: 'eventId',
    journey: {
      team: {
        userTeams: [{ userId: user.id, role: UserTeamRole.member }]
      },
      userJourneys: []
    }
  } as unknown as Event)

  const eventNoTeamRole = subject('Event', {
    id: 'eventId',
    journey: {
      team: {
        userTeams: []
      },
      userJourneys: []
    }
  } as unknown as Event)

  const eventJourneyOwner = subject('Event', {
    id: 'eventId',
    journey: {
      team: {
        userTeams: []
      },
      userJourneys: [
        {
          userId: user.id,
          role: UserJourneyRole.owner
        }
      ]
    }
  } as unknown as Event)

  const eventJourneyEditor = subject('Event', {
    id: 'eventId',
    journey: {
      team: {
        userTeams: []
      },
      userJourneys: [
        {
          userId: user.id,
          role: UserJourneyRole.editor
        }
      ]
    }
  } as unknown as Event)

  const eventEmpty = subject('Event', {
    id: 'eventId',
    journey: {
      team: {
        userTeams: []
      },
      userJourneys: []
    }
  } as unknown as Event)

  describe('read', () => {
    it('allow when user is team manager', () => {
      expect(ability.can(Action.Read, eventUserTeamManager)).toBe(true)
    })

    it('allow when user is team member', () => {
      expect(ability.can(Action.Read, eventUserTeamMember)).toBe(true)
    })

    it('deny when user has no team role', () => {
      expect(ability.can(Action.Read, eventNoTeamRole)).toBe(false)
    })

    it('allow when user is journey owner', () => {
      expect(ability.can(Action.Read, eventJourneyOwner)).toBe(true)
    })

    it('deny when user is journey editor', () => {
      expect(ability.can(Action.Read, eventJourneyEditor)).toBe(false)
    })

    it('deny when user has no userTeam or relevant journey', () => {
      expect(ability.can(Action.Read, eventEmpty)).toBe(false)
    })
  })
})
