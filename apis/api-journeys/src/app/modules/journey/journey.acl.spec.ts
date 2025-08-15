import { subject } from '@casl/ability'
import { Test, TestingModule } from '@nestjs/testing'

import {
  Journey,
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

  const journeyUserTeamManager = subject('Journey', {
    id: 'journeyId',
    team: {
      userTeams: [{ userId: user.id, role: UserTeamRole.manager }]
    }
  } as unknown as Journey)
  const journeyUserTeamMember = subject('Journey', {
    id: 'journeyId',
    team: {
      userTeams: [{ userId: user.id, role: UserTeamRole.member }]
    }
  } as unknown as Journey)
  const journeyUserJourneyOwner = subject('Journey', {
    id: 'journeyId',
    userJourneys: [
      {
        userId: user.id,
        role: UserJourneyRole.owner
      }
    ]
  } as unknown as Journey)
  const journeyUserJourneyEditor = subject('Journey', {
    id: 'journeyId',
    userJourneys: [
      {
        userId: user.id,
        role: UserJourneyRole.editor
      }
    ]
  } as unknown as Journey)
  const journeyEmpty = subject('Journey', {
    id: 'journeyId',
    userJourneys: [],
    team: { userTeams: [] }
  } as unknown as Journey)
  const journeyPublishedTemplate = subject('Journey', {
    id: 'journeyId',
    template: true,
    status: JourneyStatus.published
  } as unknown as Journey)
  const journeyUnpublishedTemplate = subject('Journey', {
    id: 'journeyId',
    template: true,
    status: JourneyStatus.draft
  } as unknown as Journey)
  const journeyJfpTeam = subject('Journey', {
    id: 'journeyId',
    teamId: 'jfp-team'
  } as unknown as Journey)

  describe('create', () => {
    it('allow when user is team member', () => {
      expect(ability.can(Action.Create, journeyUserTeamMember)).toBe(true)
    })

    it('deny when user has no userTeam', () => {
      expect(ability.can(Action.Create, journeyEmpty)).toBe(false)
    })

    it('deny when team is jfp-team', () => {
      expect(ability.can(Action.Create, journeyJfpTeam)).toBe(false)
    })

    describe('publisher', () => {
      beforeEach(async () => {
        ability = await factory.createAbility({ ...user, roles: ['publisher'] })
      })

      it('allow when team is jfp-team for publisher', () => {
        expect(ability.can(Action.Create, journeyJfpTeam)).toBe(true)
      })
    })
  })

  describe('manage', () => {
    it('allow when user is team manager', () => {
      expect(ability.can(Action.Manage, journeyUserTeamManager)).toBe(true)
    })

    it('allow when user is journey owner', () => {
      expect(ability.can(Action.Manage, journeyUserJourneyOwner)).toBe(true)
    })

    it('deny when user is team member', () => {
      expect(ability.can(Action.Manage, journeyUserTeamMember)).toBe(false)
    })

    it('deny when user is journey editor', () => {
      expect(ability.can(Action.Manage, journeyUserJourneyEditor)).toBe(false)
    })

    it('deny when user has no userTeam or userJourneys', () => {
      expect(ability.can(Action.Manage, journeyEmpty)).toBe(false)
    })

    it('deny when user is not publisher', () => {
      expect(ability.can(Action.Manage, journeyUnpublishedTemplate)).toBe(false)
    })

    it('deny template field when user is not publisher', () => {
      expect(
        ability.can(Action.Manage, journeyUserTeamManager, 'template')
      ).toBe(false)
    })

    describe('publisher', () => {
      beforeEach(async () => {
        ability = await factory.createAbility({ ...user, roles: ['publisher'] })
      })

      it('allow when user is publisher', () => {
        expect(ability.can(Action.Manage, journeyUnpublishedTemplate)).toBe(
          true
        )
      })

      it('allow template field when user is publisher and team manager', () => {
        expect(
          ability.can(Action.Manage, journeyUserTeamManager, 'template')
        ).toBe(true)
      })

      it('allow template field when user is publisher and journey owner', () => {
        expect(
          ability.can(Action.Manage, journeyUserJourneyOwner, 'template')
        ).toBe(true)
      })

      it('deny when user is publisher but has no userTeam or userJourneys', () => {
        expect(ability.can(Action.Manage, journeyEmpty, 'template')).toBe(false)
      })
    })
  })

  describe('read', () => {
    it('allow when user is team manager', () => {
      expect(ability.can(Action.Read, journeyUserTeamManager)).toBe(true)
    })

    it('allow when user is journey owner', () => {
      expect(ability.can(Action.Read, journeyUserJourneyOwner)).toBe(true)
    })

    it('allow when user is team member', () => {
      expect(ability.can(Action.Read, journeyUserTeamMember)).toBe(true)
    })

    it('allow when user is journey editor', () => {
      expect(ability.can(Action.Read, journeyUserJourneyEditor)).toBe(true)
    })

    it('allow when template and published', () => {
      expect(ability.can(Action.Read, journeyPublishedTemplate)).toBe(true)
    })

    it('deny when template and unpublished', () => {
      expect(ability.can(Action.Read, journeyUnpublishedTemplate)).toBe(false)
    })

    it('deny when user has no userTeam or userJourneys', () => {
      expect(ability.can(Action.Read, journeyEmpty)).toBe(false)
    })
  })

  describe('update', () => {
    it('allow when user is team manager', () => {
      expect(ability.can(Action.Update, journeyUserTeamManager)).toBe(true)
    })

    it('allow when user is journey owner', () => {
      expect(ability.can(Action.Update, journeyUserJourneyOwner)).toBe(true)
    })

    it('allow when user is team member', () => {
      expect(ability.can(Action.Update, journeyUserTeamMember)).toBe(true)
    })

    it('allow when user is journey editor', () => {
      expect(ability.can(Action.Update, journeyUserJourneyEditor)).toBe(true)
    })

    it('deny when user has no userTeam or userJourneys', () => {
      expect(ability.can(Action.Update, journeyEmpty)).toBe(false)
    })
  })
})
