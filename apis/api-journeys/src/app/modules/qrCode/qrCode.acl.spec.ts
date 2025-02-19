import { subject } from '@casl/ability'
import { Test, TestingModule } from '@nestjs/testing'

import {
  QrCode,
  UserJourneyRole,
  UserTeamRole
} from '.prisma/api-journeys-client'

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
    it('allow when user is team manager', () => {
      const qrCodeUserTeamManager = subject('QrCode', {
        id: 'qrCodeId',
        team: {
          userTeams: [{ userId: user.id, role: UserTeamRole.manager }]
        }
      } as unknown as QrCode)
      expect(ability.can(Action.Manage, qrCodeUserTeamManager)).toBe(true)
    })

    describe('publisher', () => {
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
    })
  })

  describe('read', () => {
    it('allow when user is journey owner', () => {
      const qrCodeUserJourneyMember = subject('QrCode', {
        id: 'qrCodeId',
        journey: {
          userJourneys: [{ userId: user.id, role: UserJourneyRole.owner }]
        }
      } as unknown as QrCode)
      expect(ability.can(Action.Read, qrCodeUserJourneyMember)).toBe(true)
    })
  })

  describe('update', () => {
    it('allow when user is journey owner', () => {
      const qrCodeUserJourneyMember = subject('QrCode', {
        id: 'qrCodeId',
        journey: {
          userJourneys: [{ userId: user.id, role: UserJourneyRole.owner }]
        }
      } as unknown as QrCode)
      expect(ability.can(Action.Update, qrCodeUserJourneyMember)).toBe(true)
    })
  })
})
