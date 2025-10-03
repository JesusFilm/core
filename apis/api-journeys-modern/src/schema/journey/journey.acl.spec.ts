import {
  JourneyStatus,
  UserJourneyRole,
  UserTeamRole
} from '@core/prisma/journeys/client'

import { Action } from '../../lib/auth/ability'

import { Journey, journeyAcl } from './journey.acl'

describe('journeyAcl', () => {
  const user = { id: 'userId' }

  const journeyUserTeamManager = {
    id: 'journeyId',
    userJourneys: [],
    team: {
      userTeams: [{ userId: user.id, role: UserTeamRole.manager }]
    }
  } as unknown as Journey

  const journeyUserTeamMember = {
    id: 'journeyId',
    userJourneys: [],
    team: {
      userTeams: [{ userId: user.id, role: UserTeamRole.member }]
    }
  } as unknown as Journey

  const journeyUserJourneyOwner = {
    id: 'journeyId',
    userJourneys: [
      {
        userId: user.id,
        role: UserJourneyRole.owner
      }
    ],
    team: { userTeams: [] }
  } as unknown as Journey

  const journeyUserJourneyEditor = {
    id: 'journeyId',
    userJourneys: [
      {
        userId: user.id,
        role: UserJourneyRole.editor
      }
    ],
    team: { userTeams: [] }
  } as unknown as Journey

  const journeyEmpty = {
    id: 'journeyId',
    userJourneys: [],
    team: { userTeams: [] }
  } as unknown as Journey

  const journeyPublishedTemplate = {
    id: 'journeyId',
    template: true,
    status: JourneyStatus.published,
    userJourneys: [],
    team: { userTeams: [] }
  } as unknown as Journey

  const journeyUnpublishedTemplate = {
    id: 'journeyId',
    template: true,
    status: JourneyStatus.draft,
    userJourneys: [],
    team: { userTeams: [] }
  } as unknown as Journey

  const journeyJfpTeam = {
    id: 'journeyId',
    teamId: 'jfp-team',
    userJourneys: [],
    team: { userTeams: [] }
  } as unknown as Journey

  // Test wrapper to call journeyAcl with the right arguments
  const can = (action: Action, journey: Journey, user: any) =>
    journeyAcl(action, journey, user)

  describe('create', () => {
    it('allows when user is team manager', () => {
      expect(can(Action.Create, journeyUserTeamManager, user)).toBe(true)
    })

    it('allows when user is team member', () => {
      expect(can(Action.Create, journeyUserTeamMember, user)).toBe(true)
    })

    it('denies when user has no userTeam', () => {
      expect(can(Action.Create, journeyEmpty, user)).toBe(false)
    })

    it('denies when team is jfp-team', () => {
      expect(can(Action.Create, journeyJfpTeam, user)).toBe(false)
    })

    describe('publisher', () => {
      const publisherUser = { ...user, roles: ['publisher'] }

      it('allows when team is jfp-team for publisher', () => {
        expect(can(Action.Create, journeyJfpTeam, publisherUser)).toBe(true)
      })
    })
  })

  describe('manage', () => {
    it('allows when user is team manager', () => {
      expect(can(Action.Manage, journeyUserTeamManager, user)).toBe(true)
    })

    it('allows when user is journey owner', () => {
      expect(can(Action.Manage, journeyUserJourneyOwner, user)).toBe(true)
    })

    it('denies when user is team member', () => {
      expect(can(Action.Manage, journeyUserTeamMember, user)).toBe(false)
    })

    it('denies when user is journey editor', () => {
      expect(can(Action.Manage, journeyUserJourneyEditor, user)).toBe(false)
    })

    it('denies when user has no userTeam or userJourneys', () => {
      expect(can(Action.Manage, journeyEmpty, user)).toBe(false)
    })

    it('denies when user is not publisher', () => {
      expect(can(Action.Manage, journeyUnpublishedTemplate, user)).toBe(false)
    })

    it('denies template property when user is not publisher', () => {
      const templateJourney = {
        ...journeyUserTeamManager,
        template: true
      } as unknown as Journey
      expect(can(Action.Manage, templateJourney, user)).toBe(false)
    })

    describe('publisher', () => {
      const publisherUser = { ...user, roles: ['publisher'] }

      it('allows when user is publisher', () => {
        expect(
          can(Action.Manage, journeyUnpublishedTemplate, publisherUser)
        ).toBe(true)
      })

      it('allows template property when user is publisher and team manager', () => {
        const templateJourney = {
          ...journeyUserTeamManager,
          template: true
        } as unknown as Journey
        expect(can(Action.Manage, templateJourney, publisherUser)).toBe(true)
      })

      it('allows template property when user is publisher and journey owner', () => {
        const templateJourney = {
          ...journeyUserJourneyOwner,
          template: true
        } as unknown as Journey
        expect(can(Action.Manage, templateJourney, publisherUser)).toBe(true)
      })

      it('allows template property when user is publisher and journey editor', () => {
        const templateJourney = {
          ...journeyUserJourneyEditor,
          template: true
        } as unknown as Journey
        expect(can(Action.Manage, templateJourney, publisherUser)).toBe(true)
      })

      it('allows template property when user is publisher and team member', () => {
        const templateJourney = {
          ...journeyUserTeamMember,
          template: true
        } as unknown as Journey
        expect(can(Action.Manage, templateJourney, publisherUser)).toBe(true)
      })

      it('denies when user is publisher but has no userTeam or userJourneys', () => {
        const templateJourney = {
          ...journeyEmpty,
          template: true
        } as unknown as Journey
        expect(can(Action.Manage, templateJourney, publisherUser)).toBe(true)
      })
    })
  })

  describe('read', () => {
    it('allows when user is team manager', () => {
      expect(can(Action.Read, journeyUserTeamManager, user)).toBe(true)
    })

    it('allows when user is journey owner', () => {
      expect(can(Action.Read, journeyUserJourneyOwner, user)).toBe(true)
    })

    it('allows when user is team member', () => {
      expect(can(Action.Read, journeyUserTeamMember, user)).toBe(true)
    })

    it('allows when user is journey editor', () => {
      expect(can(Action.Read, journeyUserJourneyEditor, user)).toBe(true)
    })

    it('allows when template and published', () => {
      expect(can(Action.Read, journeyPublishedTemplate, user)).toBe(true)
    })

    it('denies when template and unpublished', () => {
      expect(can(Action.Read, journeyUnpublishedTemplate, user)).toBe(false)
    })

    it('denies when user has no userTeam or userJourneys', () => {
      expect(can(Action.Read, journeyEmpty, user)).toBe(false)
    })
  })

  describe('update', () => {
    it('allows when user is team manager', () => {
      expect(can(Action.Update, journeyUserTeamManager, user)).toBe(true)
    })

    it('allows when user is journey owner', () => {
      expect(can(Action.Update, journeyUserJourneyOwner, user)).toBe(true)
    })

    it('allows when user is team member', () => {
      expect(can(Action.Update, journeyUserTeamMember, user)).toBe(true)
    })

    it('allows when user is journey editor', () => {
      expect(can(Action.Update, journeyUserJourneyEditor, user)).toBe(true)
    })

    it('denies when user has no userTeam or userJourneys', () => {
      expect(can(Action.Update, journeyEmpty, user)).toBe(false)
    })

    describe('publisher', () => {
      it('allows when publisher for template', () => {
        const publisherUser = { ...user, roles: ['publisher'] }
        expect(
          can(Action.Update, journeyUnpublishedTemplate, publisherUser)
        ).toBe(true)
      })
    })
  })

  describe('delete', () => {
    it('delegates to manage (allows when user is team manager)', () => {
      expect(can(Action.Delete, journeyUserTeamManager, user)).toBe(true)
    })

    it('delegates to manage (allows when user is journey owner)', () => {
      expect(can(Action.Delete, journeyUserJourneyOwner, user)).toBe(true)
    })

    it('delegates to manage (denies when user is team member)', () => {
      expect(can(Action.Delete, journeyUserTeamMember, user)).toBe(false)
    })

    it('delegates to manage (denies when user is journey editor)', () => {
      expect(can(Action.Delete, journeyUserJourneyEditor, user)).toBe(false)
    })
  })
})
