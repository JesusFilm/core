import { subject } from '@casl/ability'
import { Test, TestingModule } from '@nestjs/testing'

import {
  Block,
  JourneyStatus,
  UserJourneyRole,
  UserTeamRole
} from '@core/prisma/journeys/client'

import { Action, AppAbility, AppCaslFactory } from '../../lib/casl/caslFactory'

describe('journeyAcl', () => {
  let factory: AppCaslFactory, ability: AppAbility
  const user = { id: 'userId' }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppCaslFactory]
    }).compile()
    factory = module.get<AppCaslFactory>(AppCaslFactory)
    ability = await factory.createAbility(user)
  })

  const blockJourneyUserTeamManager = subject('Block', {
    id: 'blockId',
    journey: {
      id: 'journeyId',
      team: {
        userTeams: [{ userId: user.id, role: UserTeamRole.manager }]
      }
    }
  } as unknown as Block)
  const blockJourneyUserTeamMember = subject('Block', {
    id: 'blockId',
    journey: {
      id: 'journeyId',
      team: {
        userTeams: [{ userId: user.id, role: UserTeamRole.member }]
      }
    }
  } as unknown as Block)
  const blockJourneyUserJourneyOwner = subject('Block', {
    id: 'blockId',
    journey: {
      id: 'journeyId',
      userJourneys: [
        {
          userId: user.id,
          role: UserJourneyRole.owner
        }
      ]
    }
  } as unknown as Block)
  const blockJourneyUserJourneyEditor = subject('Block', {
    id: 'blockId',
    journey: {
      id: 'journeyId',
      userJourneys: [
        {
          userId: user.id,
          role: UserJourneyRole.editor
        }
      ]
    }
  } as unknown as Block)
  const blockJourneyEmpty = subject('Block', {
    id: 'blockId',
    journey: {
      id: 'journeyId',
      userJourneys: [],
      team: { userTeams: [] }
    }
  } as unknown as Block)
  const blockJourneyPublishedTemplate = subject('Block', {
    id: 'blockId',
    journey: {
      id: 'journeyId',
      template: true,
      status: JourneyStatus.published
    }
  } as unknown as Block)
  const blockJourneyUnpublishedTemplate = subject('Block', {
    id: 'blockId',
    journey: {
      id: 'journeyId',
      template: true,
      status: JourneyStatus.draft
    }
  } as unknown as Block)
  const blockJourneyJfpTeam = subject('Block', {
    id: 'blockId',
    journey: {
      id: 'journeyId',
      teamId: 'jfp-team'
    }
  } as unknown as Block)

  describe('manage', () => {
    it('allow when user is team manager', () => {
      expect(ability.can(Action.Manage, blockJourneyUserTeamManager)).toBe(true)
    })

    it('allow when user is journey owner', () => {
      expect(ability.can(Action.Manage, blockJourneyUserJourneyOwner)).toBe(
        true
      )
    })

    it('allow when user is team member', () => {
      expect(ability.can(Action.Manage, blockJourneyUserTeamMember)).toBe(true)
    })

    it('allow when user is journey editor', () => {
      expect(ability.can(Action.Manage, blockJourneyUserJourneyEditor)).toBe(
        true
      )
    })

    it('deny when user has no userTeam or userJourneys', () => {
      expect(ability.can(Action.Manage, blockJourneyEmpty)).toBe(false)
    })

    it('deny when user is not publisher', () => {
      expect(ability.can(Action.Manage, blockJourneyUnpublishedTemplate)).toBe(
        false
      )
    })

    describe('publisher', () => {
      beforeEach(async () => {
        ability = await factory.createAbility({ ...user, roles: ['publisher'] })
      })

      it('allow when team is jfp-team for publisher', () => {
        expect(ability.can(Action.Create, blockJourneyJfpTeam)).toBe(true)
      })

      it('allow when user is publisher', () => {
        expect(
          ability.can(Action.Manage, blockJourneyUnpublishedTemplate)
        ).toBe(true)
      })

      it('deny when user is publisher but has no userTeam or userJourneys', () => {
        expect(ability.can(Action.Manage, blockJourneyEmpty, 'template')).toBe(
          false
        )
      })
    })
  })

  describe('read', () => {
    it('allow when template and published', () => {
      expect(ability.can(Action.Read, blockJourneyPublishedTemplate)).toBe(true)
    })

    it('deny when template and unpublished', () => {
      expect(ability.can(Action.Read, blockJourneyUnpublishedTemplate)).toBe(
        false
      )
    })

    it('deny when user has no userTeam or userJourneys', () => {
      expect(ability.can(Action.Read, blockJourneyEmpty)).toBe(false)
    })
  })
})
