import { subject } from '@casl/ability'
import { Test, TestingModule } from '@nestjs/testing'

import {
  Journey,
  JourneyStatus,
  UserJourneyRole,
  UserTeamRole
} from '.prisma/api-journeys-client'

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
      expect(ability.can(Action.Create, journeyUserTeamMember)).toEqual(true)
    })
    it('deny when user has no userTeam', () => {
      expect(ability.can(Action.Create, journeyEmpty)).toEqual(false)
    })
    it('deny when team is jfp-team', () => {
      expect(ability.can(Action.Create, journeyJfpTeam)).toEqual(false)
    })
    describe('publisher', () => {
      beforeEach(async () => {
        ability = await factory.createAbility({ ...user, roles: ['publisher'] })
      })
      it('allow when team is jfp-team for publisher', () => {
        expect(ability.can(Action.Create, journeyJfpTeam)).toEqual(true)
      })
    })
  })
  describe('manage', () => {
    it('allow when user is team manager', () => {
      expect(ability.can(Action.Manage, journeyUserTeamManager)).toEqual(true)
    })
    it('allow when user is journey owner', () => {
      expect(ability.can(Action.Manage, journeyUserJourneyOwner)).toEqual(true)
    })
    it('deny when user is team member', () => {
      expect(ability.can(Action.Manage, journeyUserTeamMember)).toEqual(false)
    })
    it('deny when user is journey editor', () => {
      expect(ability.can(Action.Manage, journeyUserJourneyEditor)).toEqual(
        false
      )
    })
    it('deny when user has no userTeam or userJourneys', () => {
      expect(ability.can(Action.Manage, journeyEmpty)).toEqual(false)
    })
    it('deny when user is not publisher', () => {
      expect(ability.can(Action.Manage, journeyUnpublishedTemplate)).toEqual(
        false
      )
    })
    it('deny template field when user is not publisher', () => {
      expect(
        ability.can(Action.Manage, journeyUserTeamManager, 'template')
      ).toEqual(false)
    })
    describe('publisher', () => {
      beforeEach(async () => {
        ability = await factory.createAbility({ ...user, roles: ['publisher'] })
      })
      it('allow when user is publisher', () => {
        expect(ability.can(Action.Manage, journeyUnpublishedTemplate)).toEqual(
          true
        )
      })
      it('allow template field when user is publisher and team manager', () => {
        expect(
          ability.can(Action.Manage, journeyUserTeamManager, 'template')
        ).toEqual(true)
      })
      it('allow template field when user is publisher and journey owner', () => {
        expect(
          ability.can(Action.Manage, journeyUserJourneyOwner, 'template')
        ).toEqual(true)
      })
      it('deny when user is publisher but has no userTeam or userJourneys', () => {
        expect(ability.can(Action.Manage, journeyEmpty, 'template')).toEqual(
          false
        )
      })
    })
  })
  describe('read', () => {
    it('allow when user is team manager', () => {
      expect(ability.can(Action.Read, journeyUserTeamManager)).toEqual(true)
    })
    it('allow when user is journey owner', () => {
      expect(ability.can(Action.Read, journeyUserJourneyOwner)).toEqual(true)
    })
    it('allow when user is team member', () => {
      expect(ability.can(Action.Read, journeyUserTeamMember)).toEqual(true)
    })
    it('allow when user is journey editor', () => {
      expect(ability.can(Action.Read, journeyUserJourneyEditor)).toEqual(true)
    })
    it('allow when template and published', () => {
      expect(ability.can(Action.Read, journeyPublishedTemplate)).toEqual(true)
    })
    it('deny when template and unpublished', () => {
      expect(ability.can(Action.Read, journeyUnpublishedTemplate)).toEqual(
        false
      )
    })
    it('deny when user has no userTeam or userJourneys', () => {
      expect(ability.can(Action.Read, journeyEmpty)).toEqual(false)
    })
  })
  describe('update', () => {
    it('allow when user is team manager', () => {
      expect(ability.can(Action.Update, journeyUserTeamManager)).toEqual(true)
    })
    it('allow when user is journey owner', () => {
      expect(ability.can(Action.Update, journeyUserJourneyOwner)).toEqual(true)
    })
    it('allow when user is team member', () => {
      expect(ability.can(Action.Update, journeyUserTeamMember)).toEqual(true)
    })
    it('allow when user is journey editor', () => {
      expect(ability.can(Action.Update, journeyUserJourneyEditor)).toEqual(true)
    })
    it('deny when user has no userTeam or userJourneys', () => {
      expect(ability.can(Action.Update, journeyEmpty)).toEqual(false)
    })
  })
})
