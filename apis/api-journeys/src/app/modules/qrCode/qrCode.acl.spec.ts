import { subject } from '@casl/ability'
import { Test, TestingModule } from '@nestjs/testing'

import {
  QrCode,
  UserJourneyRole,
  UserTeamRole
} from '@core/prisma/journeys/client'

import { Action, AppAbility, AppCaslFactory } from '../../lib/casl/caslFactory'

describe('qrCodeAcl', () => {
  let factory: AppCaslFactory, ability: AppAbility
  const user = { id: 'userId' }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppCaslFactory]
    }).compile()
    factory = module.get<AppCaslFactory>(AppCaslFactory)
    ability = await factory.createAbility(user)
  })

  describe('manage', () => {
    describe('team permissions', () => {
      it('allow when user is team manager', () => {
        const qrCodeUserTeamManager = subject('QrCode', {
          id: 'qrCodeId',
          team: {
            userTeams: [{ userId: user.id, role: UserTeamRole.manager }]
          }
        } as unknown as QrCode)
        expect(ability.can(Action.Manage, qrCodeUserTeamManager)).toBe(true)
      })

      it('allow when user is team member', () => {
        const qrCodeUserTeamMember = subject('QrCode', {
          id: 'qrCodeId',
          team: {
            userTeams: [{ userId: user.id, role: UserTeamRole.member }]
          }
        } as unknown as QrCode)
        expect(ability.can(Action.Manage, qrCodeUserTeamMember)).toBe(true)
      })
    })

    describe('journey permissions', () => {
      it('allow when user is journey owner', () => {
        const qrCodeUserJourneyOwner = subject('QrCode', {
          id: 'qrCodeId',
          journey: {
            userJourneys: [{ userId: user.id, role: UserJourneyRole.owner }]
          }
        } as unknown as QrCode)
        expect(ability.can(Action.Manage, qrCodeUserJourneyOwner)).toBe(true)
      })

      it('allow when user is journey editor', () => {
        const qrCodeUserJourneyEditor = subject('QrCode', {
          id: 'qrCodeId',
          journey: {
            userJourneys: [{ userId: user.id, role: UserJourneyRole.editor }]
          }
        } as unknown as QrCode)
        expect(ability.can(Action.Manage, qrCodeUserJourneyEditor)).toBe(true)
      })
    })

    describe('publisher permissions', () => {
      beforeEach(async () => {
        ability = await factory.createAbility({ ...user, roles: ['publisher'] })
      })

      it('allow when user is publisher and journey is template', () => {
        const qrCodeUserPublisher = subject('QrCode', {
          id: 'qrCodeId',
          journey: {
            template: true
          }
        } as unknown as QrCode)
        expect(ability.can(Action.Manage, qrCodeUserPublisher)).toBe(true)
      })

      it('deny when user is publisher but journey is not template', () => {
        const qrCodeUserPublisher = subject('QrCode', {
          id: 'qrCodeId',
          journey: {
            template: false
          }
        } as unknown as QrCode)
        expect(ability.can(Action.Manage, qrCodeUserPublisher)).toBe(false)
      })
    })
  })
})
