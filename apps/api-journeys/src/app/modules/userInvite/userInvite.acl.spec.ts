import { Test, TestingModule } from '@nestjs/testing'
import { subject } from '@casl/ability'
import {
  UserTeamRole,
  UserJourneyRole,
  UserInvite
} from '.prisma/api-journeys-client'
import { Action, AppAbility, AppCaslFactory } from '../../lib/casl/caslFactory'

describe('userInviteAcl', () => {
  let factory: AppCaslFactory, ability: AppAbility
  const user = { id: 'userId' }
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppCaslFactory]
    }).compile()
    factory = module.get<AppCaslFactory>(AppCaslFactory)
    ability = await factory.createAbility(user)
  })
  const userInviteUserTeamManager = subject('UserInvite', {
    id: 'userInviteId',
    removedAt: null,
    acceptedAt: null,
    journey: {
      team: {
        userTeams: [{ userId: user.id, role: UserTeamRole.manager }]
      }
    }
  } as unknown as UserInvite)
  const userInviteUserTeamMember = subject('UserInvite', {
    id: 'userInviteId',
    removedAt: null,
    acceptedAt: null,
    journey: {
      team: {
        userTeams: [{ userId: user.id, role: UserTeamRole.member }]
      }
    }
  } as unknown as UserInvite)
  const userInviteUserJourneyOwner = subject('UserInvite', {
    id: 'userInviteId',
    removedAt: null,
    acceptedAt: null,
    journey: {
      userJourneys: [
        {
          userId: user.id,
          role: UserJourneyRole.owner
        }
      ]
    }
  } as unknown as UserInvite)
  const userInviteUserJourneyEditor = subject('UserInvite', {
    id: 'userInviteId',
    removedAt: null,
    acceptedAt: null,
    journey: {
      userJourneys: [
        {
          userId: user.id,
          role: UserJourneyRole.editor
        }
      ]
    }
  } as unknown as UserInvite)
  const userInviteEmpty = subject('UserInvite', {
    id: 'userInviteId',
    removedAt: null,
    acceptedAt: null,
    journey: {
      userJourneys: [],
      team: { userTeams: [] }
    }
  } as unknown as UserInvite)
  describe('manage', () => {
    it('allow when user is team manager', () => {
      expect(ability.can(Action.Manage, userInviteUserTeamManager)).toEqual(
        true
      )
    })
    it('allow when user is journey owner', () => {
      expect(ability.can(Action.Manage, userInviteUserJourneyOwner)).toEqual(
        true
      )
    })
    it('allow when user is team member', () => {
      expect(ability.can(Action.Manage, userInviteUserTeamMember)).toEqual(true)
    })
    it('allow when user is journey editor', () => {
      expect(ability.can(Action.Manage, userInviteUserJourneyEditor)).toEqual(
        true
      )
    })
    it('deny when user has no userTeam or userJourneys', () => {
      expect(ability.can(Action.Manage, userInviteEmpty)).toEqual(false)
    })
    describe('removedAt', () => {
      it('deny when user is team manager', () => {
        expect(
          ability.can(Action.Manage, {
            ...userInviteUserTeamManager,
            removedAt: new Date()
          })
        ).toEqual(false)
      })
      it('deny when user is team member', () => {
        expect(
          ability.can(Action.Manage, {
            ...userInviteUserTeamMember,
            removedAt: new Date()
          })
        ).toEqual(false)
      })
      it('deny when user has no userTeam', () => {
        expect(
          ability.can(Action.Manage, {
            ...userInviteEmpty,
            removedAt: new Date()
          })
        ).toEqual(false)
      })
    })
    describe('acceptedAt', () => {
      it('deny when user is team manager', () => {
        expect(
          ability.can(Action.Manage, {
            ...userInviteUserTeamManager,
            acceptedAt: new Date()
          })
        ).toEqual(false)
      })
      it('deny when user is team member', () => {
        expect(
          ability.can(Action.Manage, {
            ...userInviteUserTeamMember,
            acceptedAt: new Date()
          })
        ).toEqual(false)
      })
      it('deny when user has no userTeam', () => {
        expect(
          ability.can(Action.Manage, {
            ...userInviteEmpty,
            acceptedAt: new Date()
          })
        ).toEqual(false)
      })
    })
  })
})
