import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import { v4 as uuidv4 } from 'uuid'

import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'
import { QrCode, UserTeamRole } from '@core/prisma/journeys/client'

import { MutationShortLinkCreateSuccess } from '../../../__generated__/graphql'
import { AppAbility, AppCaslFactory } from '../../lib/casl/caslFactory'
import { PrismaService } from '../../lib/prisma.service'

import { INCLUDE_QR_CODE_ACL } from './qrCode.acl'
import { QrCodeResolver } from './qrCode.resolver'
import { QrCodeService } from './qrCode.service'

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

// uuid v11 types include overloads that may infer a Uint8Array return when mocked.
// Cast to a simple zero-arg string-returning function for tests.
const mockUuidv4 = uuidv4 as unknown as jest.MockedFunction<() => string>

describe('QrCode', () => {
  let resolver: QrCodeResolver,
    qrCodeService: DeepMockProxy<QrCodeService>,
    prismaService: DeepMockProxy<PrismaService>,
    ability: AppAbility

  const originalEnv = process.env

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CaslAuthModule.register(AppCaslFactory)],
      providers: [
        QrCodeResolver,
        {
          provide: QrCodeService,
          useValue: mockDeep<QrCodeService>()
        },
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()

    resolver = module.get<QrCodeResolver>(QrCodeResolver)
    qrCodeService = module.get<QrCodeService>(
      QrCodeService
    ) as DeepMockProxy<QrCodeService>
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
    ability = await new AppCaslFactory().createAbility({
      id: 'userId'
    })
  })

  afterEach(() => {
    jest.resetAllMocks()
    process.env = originalEnv
  })

  const qrCode = {
    journeyId: 'journeyId',
    teamId: 'teamId',
    toJourneyId: 'journeyId',
    shortLinkId: 'shortLinkId'
  } as unknown as QrCode

  const qrCodeWithAuth = {
    ...qrCode,
    team: {
      userTeams: [
        {
          userId: 'userId',
          role: UserTeamRole.manager
        }
      ]
    }
  }

  const qrCodeUnauth = {
    ...qrCode,
    team: {
      userTeams: [{ userId: 'unauthedId' }]
    }
  }

  describe('qrCode', () => {
    it('should get qr code', async () => {
      prismaService.qrCode.findUniqueOrThrow.mockResolvedValue(qrCode)
      expect(await resolver.qrCode(qrCode.id)).toEqual(qrCode)
      expect(prismaService.qrCode.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: qrCode.id },
        include: {
          ...INCLUDE_QR_CODE_ACL
        }
      })
    })
  })

  describe('qrCodes', () => {
    it('should get qr codes for journey', async () => {
      prismaService.qrCode.findMany.mockResolvedValue([qrCode])
      expect(await resolver.qrCodes({ journeyId: 'journeyId' })).toEqual([
        qrCode
      ])
      expect(prismaService.qrCode.findMany).toHaveBeenCalledWith({
        where: { journeyId: 'journeyId' }
      })
    })

    it('should get qr codes for team', async () => {
      prismaService.qrCode.findMany.mockResolvedValue([qrCode])
      expect(await resolver.qrCodes({ teamId: 'teamId' })).toEqual([qrCode])
      expect(prismaService.qrCode.findMany).toHaveBeenCalledWith({
        where: { teamId: 'teamId' }
      })
    })
  })

  describe('qrCodeCreate', () => {
    beforeEach(() => {
      mockUuidv4.mockReturnValue('shortLinkId')
      qrCodeService.getTo.mockResolvedValue('to')
      qrCodeService.createShortLink.mockResolvedValue({
        data: { id: 'shortLinkId' }
      } as unknown as MutationShortLinkCreateSuccess)
      prismaService.$transaction.mockImplementation(
        async (callback) => await callback(prismaService)
      )
      process.env.JOURNEYS_SHORTLINK_DOMAIN = 'nxstp.is'
    })

    it('should create qr code', async () => {
      prismaService.qrCode.create.mockResolvedValue(qrCodeWithAuth)

      const res = await resolver.qrCodeCreate(
        { journeyId: 'journeyId', teamId: 'teamId' },
        ability
      )
      expect(res).toEqual(qrCodeWithAuth)
      expect(qrCodeService.getTo).toHaveBeenCalledWith({
        shortLinkId: 'shortLinkId',
        teamId: 'teamId',
        toJourneyId: 'journeyId'
      })
      expect(prismaService.qrCode.create).toHaveBeenCalledWith({
        data: qrCode,
        include: {
          ...INCLUDE_QR_CODE_ACL
        }
      })
    })

    it('throws error if not authorized', async () => {
      prismaService.qrCode.create.mockResolvedValue(qrCodeUnauth)

      await expect(
        resolver.qrCodeCreate(
          { journeyId: 'journeyId', teamId: 'teamId' },
          ability
        )
      ).rejects.toThrow('User is not allowed to create the QrCode')
    })
  })

  describe('qrCodeUpdate', () => {
    beforeEach(() => {
      qrCodeService.parseAndVerifyTo.mockResolvedValue({
        toJourneyId: 'toJourneyId',
        toBlockId: 'toBlockId'
      })
      qrCodeService.getTo.mockResolvedValue('updatedTo')
      prismaService.$transaction.mockImplementation(
        async (callback) => await callback(prismaService)
      )
    })

    it('should update qr code', async () => {
      prismaService.qrCode.findUniqueOrThrow.mockResolvedValue(qrCodeWithAuth)
      prismaService.qrCode.update.mockResolvedValue(qrCode)
      const res = await resolver.qrCodeUpdate(
        'qrCodeId',
        { to: 'updatedTo', color: '#AAAAAA', backgroundColor: '#BBBBBB' },
        ability
      )
      expect(res).toEqual(qrCode)
      expect(prismaService.qrCode.update).toHaveBeenCalledWith({
        where: { id: 'qrCodeId' },
        data: {
          color: '#AAAAAA',
          backgroundColor: '#BBBBBB',
          toJourneyId: 'toJourneyId',
          toBlockId: 'toBlockId'
        }
      })
    })

    it('throws error if not authorized', async () => {
      prismaService.qrCode.findUniqueOrThrow.mockResolvedValue(qrCodeUnauth)
      await expect(
        resolver.qrCodeUpdate('qrCodeId', { to: 'updatedTo' }, ability)
      ).rejects.toThrow('User is not allowed to update the QrCode')
    })
  })

  describe('qrCodeDelete', () => {
    beforeEach(() => {
      prismaService.$transaction.mockImplementation(
        async (callback) => await callback(prismaService)
      )
    })

    it('should delete qrCode', async () => {
      prismaService.qrCode.findUniqueOrThrow.mockResolvedValue(qrCodeWithAuth)
      prismaService.qrCode.delete.mockResolvedValue(qrCode)

      const res = await resolver.qrCodeDelete('qrCodeId', ability)
      expect(res).toEqual(qrCode)
      expect(prismaService.qrCode.delete).toHaveBeenCalledWith({
        where: { id: 'qrCodeId' }
      })
    })

    it('throws error if not authorized', async () => {
      prismaService.qrCode.findUniqueOrThrow.mockResolvedValue(qrCodeUnauth)
      await expect(resolver.qrCodeDelete('qrCodeId', ability)).rejects.toThrow(
        'User is not allowed to delete the QrCode'
      )
    })
  })

  describe('shortLink', () => {
    it('returns object for federation', async () => {
      expect(await resolver.shortLink(qrCode)).toEqual({
        __typename: 'ShortLink',
        id: 'shortLinkId'
      })
    })
  })
})
