import { subject } from '@casl/ability'
import { Test, TestingModule } from '@nestjs/testing'

import {
  UserJourney,
  UserJourneyRole,
  UserTeamRole
} from '.prisma/api-journeys-client'

import { Action, AppAbility, AppCaslFactory } from '../../lib/casl/caslFactory'

describe('userJourneyAcl', () => {
  let factory: AppCaslFactory, ability: AppAbility
  const user = { id: 'userId' }
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppCaslFactory]
    }).compile()
    factory = module.get<AppCaslFactory>(AppCaslFactory)
    ability = await factory.createAbility(user)
  })
  const userJourneyUserTeamManager = subject('UserJourney', {
    id: 'userJourneyId',
    journey: {
      team: {
        userTeams: [{ userId: user.id, role: UserTeamRole.manager }]
      }
    }
  } as unknown as UserJourney)
  const userJourneyUserTeamMember = subject('UserJourney', {
    id: 'userJourneyId',
    journey: {
      team: {
        userTeams: [{ userId: user.id, role: UserTeamRole.member }]
      }
    }
  } as unknown as UserJourney)
  const userJourneyUserJourneyOwner = subject('UserJourney', {
    id: 'userJourneyId',
    journey: {
      userJourneys: [
        {
          userId: user.id,
          role: UserJourneyRole.owner
        }
      ]
    }
  } as unknown as UserJourney)
  const userJourneyUserJourneyEditor = subject('UserJourney', {
    id: 'userJourneyId',
    journey: {
      userJourneys: [
        {
          userId: user.id,
          role: UserJourneyRole.editor
        }
      ]
    }
  } as unknown as UserJourney)
  const userJourneyEmpty = subject('UserJourney', {
    id: 'userJourneyId',
    journey: {
      userJourneys: [],
      team: { userTeams: [] }
    }
  } as unknown as UserJourney)
  const userJourneyUser = subject('UserJourney', {
    id: 'userJourneyId',
    userId: 'userId'
  } as unknown as UserJourney)
  const userJourneyInvitedUser = subject('UserJourney', {
    id: 'userJourneyId',
    userId: 'userId',
    role: UserJourneyRole.inviteRequested
  } as unknown as UserJourney)
  describe('create', () => {
    it('deny when user is team manager', () => {
      expect(ability.can(Action.Create, userJourneyUserTeamManager)).toEqual(
        false
      )
    })
    it('deny when user is journey owner', () => {
      expect(ability.can(Action.Create, userJourneyUserJourneyOwner)).toEqual(
        false
      )
    })
    it('deny when user is team member', () => {
      expect(ability.can(Action.Create, userJourneyUserTeamMember)).toEqual(
        false
      )
    })
    it('deny when user is journey editor', () => {
      expect(ability.can(Action.Create, userJourneyUserJourneyEditor)).toEqual(
        false
      )
    })
    it('allow when user is invited user', () => {
      expect(ability.can(Action.Create, userJourneyInvitedUser)).toEqual(true)
    })
    it('deny when user has no userTeam or userJourneys', () => {
      expect(ability.can(Action.Create, userJourneyEmpty)).toEqual(false)
    })
  })
  describe('read', () => {
    it('allow when user is team manager', () => {
      expect(ability.can(Action.Read, userJourneyUserTeamManager)).toEqual(true)
    })
    it('allow when user is journey owner', () => {
      expect(ability.can(Action.Read, userJourneyUserJourneyOwner)).toEqual(
        true
      )
    })
    it('allow when user is team member', () => {
      expect(ability.can(Action.Read, userJourneyUserTeamMember)).toEqual(true)
    })
    it('allow when user is journey editor', () => {
      expect(ability.can(Action.Read, userJourneyUserJourneyEditor)).toEqual(
        true
      )
    })
    it('deny when user has no userTeam or userJourneys', () => {
      expect(ability.can(Action.Read, userJourneyEmpty)).toEqual(false)
    })
  })
  describe('update', () => {
    describe('role', () => {
      it('allow when user is team manager', () => {
        expect(
          ability.can(Action.Update, userJourneyUserTeamManager, 'role')
        ).toEqual(true)
      })
      it('allow when user is journey owner', () => {
        expect(
          ability.can(Action.Update, userJourneyUserJourneyOwner, 'role')
        ).toEqual(true)
      })
      it('deny when user is team member', () => {
        expect(
          ability.can(Action.Update, userJourneyUserTeamMember, 'role')
        ).toEqual(false)
      })
      it('deny when user is journey editor', () => {
        expect(
          ability.can(Action.Update, userJourneyUserJourneyEditor, 'role')
        ).toEqual(false)
      })
      it('deny when user is user', () => {
        expect(ability.can(Action.Update, userJourneyUser, 'role')).toEqual(
          false
        )
      })
      it('deny when user has no userTeam or userJourneys', () => {
        expect(
          ability.can(Action.Update, userJourneyEmpty, 'openedAt')
        ).toEqual(false)
      })
    })
    describe('openedAt', () => {
      it('deny when user is team manager', () => {
        expect(
          ability.can(Action.Update, userJourneyUserTeamManager, 'openedAt')
        ).toEqual(false)
      })
      it('deny when user is journey owner', () => {
        expect(
          ability.can(Action.Update, userJourneyUserJourneyOwner, 'openedAt')
        ).toEqual(false)
      })
      it('deny when user is team member', () => {
        expect(
          ability.can(Action.Update, userJourneyUserTeamMember, 'openedAt')
        ).toEqual(false)
      })
      it('deny when user is journey editor', () => {
        expect(
          ability.can(Action.Update, userJourneyUserJourneyEditor, 'openedAt')
        ).toEqual(false)
      })
      it('allow when user is user', () => {
        expect(ability.can(Action.Update, userJourneyUser, 'openedAt')).toEqual(
          true
        )
      })
      it('deny when user has no userTeam or userJourneys', () => {
        expect(
          ability.can(Action.Update, userJourneyEmpty, 'openedAt')
        ).toEqual(false)
      })
    })
  })
  describe('delete', () => {
    it('allow when user is team manager', () => {
      expect(ability.can(Action.Delete, userJourneyUserTeamManager)).toEqual(
        true
      )
    })
    it('allow when user is journey owner', () => {
      expect(ability.can(Action.Delete, userJourneyUserJourneyOwner)).toEqual(
        true
      )
    })
    it('deny when user is team member', () => {
      expect(ability.can(Action.Delete, userJourneyUserTeamMember)).toEqual(
        false
      )
    })
    it('deny when user is journey editor', () => {
      expect(ability.can(Action.Delete, userJourneyUserJourneyEditor)).toEqual(
        false
      )
    })
    it('deny when user has no userTeam or userJourneys', () => {
      expect(ability.can(Action.Delete, userJourneyEmpty)).toEqual(false)
    })
  })
})
