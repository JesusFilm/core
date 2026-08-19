import {
  JourneyStatus,
  UserJourneyRole,
  UserTeamRole
} from '@core/prisma/journeys/client'

import { Action } from '../../lib/auth/ability'

import { Journey, canManageTemplateField, journeyAcl } from './journey.acl'

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

  const journeyUserJourneyInviteRequested = {
    id: 'journeyId',
    userJourneys: [
      {
        userId: user.id,
        role: UserJourneyRole.inviteRequested
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

    it('denies when user has inviteRequested role', () => {
      expect(can(Action.Manage, journeyUserJourneyInviteRequested, user)).toBe(
        false
      )
    })

    it('denies when user has no userTeam or userJourneys', () => {
      expect(can(Action.Manage, journeyEmpty, user)).toBe(false)
    })

    it('denies when user is not publisher', () => {
      expect(can(Action.Manage, journeyUnpublishedTemplate, user)).toBe(false)
    })

    it('allows team manager on template journey (manage restricts field, not whole-journey)', () => {
      const templateJourney = {
        ...journeyUserTeamManager,
        template: true
      } as unknown as Journey
      expect(can(Action.Manage, templateJourney, user)).toBe(true)
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

    it('denies when user has inviteRequested role', () => {
      expect(can(Action.Read, journeyUserJourneyInviteRequested, user)).toBe(
        false
      )
    })

    it('allows when user has inviteRequested role but is team member', () => {
      const journey = {
        id: 'journeyId',
        userJourneys: [
          { userId: user.id, role: UserJourneyRole.inviteRequested }
        ],
        team: {
          userTeams: [{ userId: user.id, role: UserTeamRole.member }]
        }
      } as unknown as Journey
      expect(can(Action.Read, journey, user)).toBe(true)
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

    it('denies when user has inviteRequested role', () => {
      expect(can(Action.Update, journeyUserJourneyInviteRequested, user)).toBe(
        false
      )
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

    it('denies when user has inviteRequested role', () => {
      expect(can(Action.Delete, journeyUserJourneyInviteRequested, user)).toBe(
        false
      )
    })
  })

  describe('export', () => {
    it('allows when user is journey owner', () => {
      expect(can(Action.Export, journeyUserJourneyOwner, user)).toBe(true)
    })

    it('allows when user is team member', () => {
      expect(can(Action.Export, journeyUserTeamMember, user)).toBe(true)
    })

    it('allows when user is team manager', () => {
      expect(can(Action.Export, journeyUserTeamManager, user)).toBe(true)
    })

    it('denies when user is journey editor', () => {
      expect(can(Action.Export, journeyUserJourneyEditor, user)).toBe(false)
    })

    it('denies when user has inviteRequested role', () => {
      expect(can(Action.Export, journeyUserJourneyInviteRequested, user)).toBe(
        false
      )
    })

    it('denies when user has no userTeam or userJourneys', () => {
      expect(can(Action.Export, journeyEmpty, user)).toBe(false)
    })
  })
})

describe('canManageTemplateField', () => {
  const user = { id: 'userId', firstName: 'Test', emailVerified: true }
  const publisher = { ...user, roles: ['publisher'] }

  const jfpTemplateNoRoles = {
    id: 'journeyId',
    template: true,
    teamId: 'jfp-team',
    userJourneys: [],
    team: { userTeams: [] }
  } as unknown as Journey

  const jfpTemplateTeamManager = {
    id: 'journeyId',
    template: true,
    teamId: 'jfp-team',
    userJourneys: [],
    team: { userTeams: [{ userId: user.id, role: UserTeamRole.manager }] }
  } as unknown as Journey

  const localTemplateNoRoles = {
    id: 'journeyId',
    template: true,
    teamId: 'teamId',
    userJourneys: [],
    team: { userTeams: [] }
  } as unknown as Journey

  const localTemplateTeamMember = {
    id: 'journeyId',
    template: true,
    teamId: 'teamId',
    userJourneys: [],
    team: { userTeams: [{ userId: user.id, role: UserTeamRole.member }] }
  } as unknown as Journey

  const localTemplateJourneyEditor = {
    id: 'journeyId',
    template: true,
    teamId: 'teamId',
    userJourneys: [{ userId: user.id, role: UserJourneyRole.editor }],
    team: { userTeams: [] }
  } as unknown as Journey

  const journeyOwnerNonTemplate = {
    id: 'journeyId',
    template: false,
    teamId: 'teamId',
    userJourneys: [{ userId: user.id, role: UserJourneyRole.owner }],
    team: { userTeams: [] }
  } as unknown as Journey

  const journeyNoRolesNonTemplate = {
    id: 'journeyId',
    template: false,
    teamId: 'teamId',
    userJourneys: [],
    team: { userTeams: [] }
  } as unknown as Journey

  describe('publisher', () => {
    it('allows any template without team or journey roles (QA-563)', () => {
      expect(canManageTemplateField(jfpTemplateNoRoles, publisher)).toBe(true)
      expect(canManageTemplateField(localTemplateNoRoles, publisher)).toBe(true)
    })

    it('allows converting an owned journey to a template', () => {
      expect(canManageTemplateField(journeyOwnerNonTemplate, publisher)).toBe(
        true
      )
    })

    it('denies a non-template journey without team or journey roles', () => {
      expect(canManageTemplateField(journeyNoRolesNonTemplate, publisher)).toBe(
        false
      )
    })
  })

  describe('non-publisher', () => {
    it('allows local templates for team members and journey editors', () => {
      expect(canManageTemplateField(localTemplateTeamMember, user)).toBe(true)
      expect(canManageTemplateField(localTemplateJourneyEditor, user)).toBe(
        true
      )
    })

    it('denies jfp-team templates even for team managers', () => {
      expect(canManageTemplateField(jfpTemplateTeamManager, user)).toBe(false)
    })

    it('denies templates without team or journey roles', () => {
      expect(canManageTemplateField(jfpTemplateNoRoles, user)).toBe(false)
      expect(canManageTemplateField(localTemplateNoRoles, user)).toBe(false)
    })

    it('denies non-template journeys even for owners', () => {
      expect(canManageTemplateField(journeyOwnerNonTemplate, user)).toBe(false)
    })
  })
})
