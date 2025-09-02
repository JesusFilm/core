import { ApolloClient, ApolloQueryResult } from '@apollo/client'
import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import {
  Block,
  CustomDomain,
  Journey,
  QrCode
} from '@core/prisma/journeys/client'
import { ShortLink } from '@core/prisma/media/client'

import { Service } from '../../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'

import { QrCodeService } from './qrCode.service'

jest.mock('@apollo/client')

describe('QrCodeService', () => {
  let service: QrCodeService, prismaService: DeepMockProxy<PrismaService>
  const originalEnv = process.env

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QrCodeService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()

    service = module.get<QrCodeService>(QrCodeService)
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
  })

  afterEach(() => {
    jest.resetAllMocks()
    process.env = originalEnv
  })

  const journey = {
    id: 'journeyId',
    slug: 'journeySlug'
  } as unknown as Journey
  const toJourney = {
    id: 'toJourneyId',
    slug: 'toJourneySlug'
  } as unknown as Journey

  const toBlock = {
    id: 'toBlockId'
  } as unknown as Block

  const shortLink = {
    id: 'shortLinkId'
  } as unknown as ShortLink
  const customDomain = {
    name: 'custom.domain'
  } as unknown as CustomDomain

  const notUniqueError = {
    __typename: 'NotUniqueError',
    message: 'Not unique error message'
  }
  const notFoundError = {
    __typename: 'NotFoundError',
    message: 'Not found error message'
  }
  const zodError = {
    __typename: 'ZodError',
    message: 'Zod error message'
  }

  const qrCode = {
    id: 'qrCodeId',
    teamId: 'teamId',
    journeyId: journey.id,
    toJourneyId: toJourney.id,
    blockId: toBlock.id,
    shortLinkId: shortLink.id
  } as unknown as QrCode

  describe('getShortLink', () => {
    it('should return short link', async () => {
      jest.spyOn(ApolloClient.prototype, 'query').mockImplementation(
        async () =>
          await Promise.resolve({
            data: {
              shortLink: {
                __typename: 'QueryShortLinkSuccess',
                data: shortLink
              }
            }
          } as unknown as ApolloQueryResult<unknown>)
      )

      const result = await service.getShortLink('shortLinkId')
      expect(result).toEqual(shortLink)
    })

    it('should throw NotFoundError', async () => {
      jest.spyOn(ApolloClient.prototype, 'query').mockImplementation(
        async () =>
          await Promise.resolve({
            data: {
              shortLink: notFoundError
            }
          } as unknown as ApolloQueryResult<unknown>)
      )

      await expect(service.getShortLink('shortLinkId')).rejects.toThrow(
        notFoundError.message
      )
    })
  })

  describe('createShortLink', () => {
    it('should create short link', async () => {
      const shortLinkCreate = {
        __typename: 'MutationShortLinkCreateSuccess',
        data: {
          id: 'shortLinkId'
        } as unknown as ShortLink
      }

      jest.spyOn(ApolloClient.prototype, 'mutate').mockImplementation(
        async () =>
          await Promise.resolve({
            data: {
              shortLinkCreate
            }
          } as unknown as ApolloQueryResult<unknown>)
      )

      const result = await service.createShortLink({
        hostname: 'localhost',
        service: Service.ApiJourneys,
        to: 'to'
      })
      expect(result).toEqual(shortLinkCreate)
    })

    it('should throw NotUniqueError', async () => {
      jest.spyOn(ApolloClient.prototype, 'mutate').mockImplementation(
        async () =>
          await Promise.resolve({
            data: {
              shortLinkCreate: notUniqueError
            }
          } as unknown as ApolloQueryResult<unknown>)
      )

      await expect(
        service.createShortLink({
          hostname: 'localhost',
          service: Service.ApiJourneys,
          to: 'to'
        })
      ).rejects.toThrow(notUniqueError.message)
    })

    it('should throw ZodError', async () => {
      jest.spyOn(ApolloClient.prototype, 'mutate').mockImplementation(
        async () =>
          await Promise.resolve({
            data: {
              shortLinkCreate: zodError
            }
          } as unknown as ApolloQueryResult<unknown>)
      )

      await expect(
        service.createShortLink({
          hostname: 'localhost',
          service: Service.ApiJourneys,
          to: 'to'
        })
      ).rejects.toThrow(zodError.message)
    })
  })

  describe('updateShortLink', () => {
    it('should update short link', async () => {
      const shortLinkUpdate = {
        __typename: 'MutationShortLinkUpdateSuccess',
        data: {
          id: 'shortLinkId'
        } as unknown as ShortLink
      }

      jest.spyOn(ApolloClient.prototype, 'mutate').mockImplementation(
        async () =>
          await Promise.resolve({
            data: {
              shortLinkUpdate
            }
          } as unknown as ApolloQueryResult<unknown>)
      )

      const result = await service.updateShortLink({
        id: 'shortLinkId',
        to: 'to'
      })
      expect(result).toEqual(shortLinkUpdate)
    })

    it('should throw NotFoundError', async () => {
      jest.spyOn(ApolloClient.prototype, 'mutate').mockImplementation(
        async () =>
          await Promise.resolve({
            data: {
              shortLinkUpdate: {
                __typename: 'NotFoundError',
                message: 'Not found error message'
              }
            }
          } as unknown as ApolloQueryResult<unknown>)
      )

      await expect(
        service.updateShortLink({
          id: 'shortLinkId',
          to: 'to'
        })
      ).rejects.toThrow('Not found error message')
    })

    it('should throw ZodError', async () => {
      jest.spyOn(ApolloClient.prototype, 'mutate').mockImplementation(
        async () =>
          await Promise.resolve({
            data: {
              shortLinkUpdate: {
                __typename: 'ZodError',
                message: 'Zod error message'
              }
            }
          } as unknown as ApolloQueryResult<unknown>)
      )

      await expect(
        service.updateShortLink({
          id: 'shortLinkId',
          to: 'to'
        })
      ).rejects.toThrow('Zod error message')
    })
  })

  describe('deleteShortLink', () => {
    it('should delete short link', async () => {
      const shortLinkDelete = {
        __typename: 'MutationShortLinkDeleteSuccess',
        data: {
          id: 'shortLinkId'
        } as unknown as ShortLink
      }

      jest.spyOn(ApolloClient.prototype, 'mutate').mockImplementation(
        async () =>
          await Promise.resolve({
            data: {
              shortLinkDelete
            }
          } as unknown as ApolloQueryResult<unknown>)
      )

      const result = await service.deleteShortLink('shortLinkId')
      expect(result).toEqual(shortLinkDelete)
    })

    it('should throw NotFoundError', async () => {
      jest.spyOn(ApolloClient.prototype, 'mutate').mockImplementation(
        async () =>
          await Promise.resolve({
            data: {
              shortLinkDelete: {
                __typename: 'NotFoundError',
                message: 'Not found error message'
              }
            }
          } as unknown as ApolloQueryResult<unknown>)
      )

      await expect(service.deleteShortLink('shortLinkId')).rejects.toThrow(
        'Not found error message'
      )
    })
  })

  describe('getTo', () => {
    process.env.JOURNEYS_URL = 'https://your.nextstep.is'

    it('returns to', async () => {
      prismaService.journey.findUniqueOrThrow.mockResolvedValueOnce(journey)
      prismaService.customDomain.findMany.mockResolvedValueOnce([])

      const result = await service.getTo({
        shortLinkId: 'shortLinkId',
        teamId: 'teamId',
        toJourneyId: 'journeyId'
      })
      expect(result).toBe(
        'https://your.nextstep.is/journeySlug?utm_source=ns-qr-code&utm_campaign=shortLinkId'
      )
    })

    it('returns to for blockId', async () => {
      prismaService.journey.findUniqueOrThrow.mockResolvedValueOnce(journey)
      prismaService.customDomain.findMany.mockResolvedValueOnce([])
      prismaService.block.findUniqueOrThrow.mockResolvedValueOnce(toBlock)

      const result = await service.getTo({
        shortLinkId: 'shortLinkId',
        teamId: 'teamId',
        toJourneyId: 'journeyId',
        toBlockId: 'toBlockId'
      })
      expect(result).toBe(
        'https://your.nextstep.is/journeySlug/toBlockId?utm_source=ns-qr-code&utm_campaign=shortLinkId'
      )
    })

    it('returns to for custom domain', async () => {
      prismaService.journey.findUniqueOrThrow.mockResolvedValueOnce(journey)
      prismaService.customDomain.findMany.mockResolvedValueOnce([customDomain])

      const result = await service.getTo({
        shortLinkId: 'shortLinkId',
        teamId: 'teamId',
        toJourneyId: 'journeyId'
      })
      expect(result).toBe(
        'https://custom.domain/journeySlug?utm_source=ns-qr-code&utm_campaign=shortLinkId'
      )
    })

    it('returns to for new custom domain name and journey slug', async () => {
      prismaService.journey.findUniqueOrThrow.mockResolvedValueOnce(journey)
      prismaService.customDomain.findMany.mockResolvedValueOnce([customDomain])

      const result = await service.getTo({
        shortLinkId: 'shortLinkId',
        teamId: 'teamId',
        toJourneyId: 'journeyId',
        newCustomDomain: 'newCustom.domain',
        newJourneySlug: 'newJourneySlug'
      })
      expect(result).toBe(
        'https://newCustom.domain/newJourneySlug?utm_source=ns-qr-code&utm_campaign=shortLinkId'
      )
    })

    it('throws journey not found error', async () => {
      prismaService.journey.findUniqueOrThrow.mockRejectedValue(
        new Error('Journey not found')
      )

      await expect(
        service.getTo({
          shortLinkId: 'shortLinkId',
          teamId: 'teamId',
          toJourneyId: 'journeyId'
        })
      ).rejects.toThrow('Journey not found')
    })

    it('throws block not found error', async () => {
      prismaService.journey.findUniqueOrThrow.mockResolvedValueOnce(journey)
      prismaService.customDomain.findMany.mockResolvedValueOnce([])
      prismaService.block.findUniqueOrThrow.mockRejectedValue(
        new Error('Block not found')
      )

      await expect(
        service.getTo({
          shortLinkId: 'shortLinkId',
          teamId: 'teamId',
          toJourneyId: 'journeyId',
          toBlockId: 'blockId'
        })
      ).rejects.toThrow('Block not found')
    })
  })

  describe('updateTeamShortLinks', () => {
    it('updates short links if the qrCode has not been redirected', async () => {
      const qrCodes = [
        qrCode,
        {
          id: 'qrCodeId2',
          teamId: 'teamId',
          journeyId: 'journey2.id',
          toJourneyId: 'journey2.id'
        } as unknown as QrCode,
        {
          id: 'qrCodeId3',
          teamId: 'teamId',
          journeyId: 'journey3.id',
          toJourneyId: 'journey3.id'
        } as unknown as QrCode
      ]
      prismaService.qrCode.findMany.mockResolvedValue(qrCodes)

      jest.spyOn(service, 'getTo').mockResolvedValue('to')
      jest.spyOn(ApolloClient.prototype, 'mutate').mockImplementation(
        async () =>
          await Promise.resolve({
            data: {
              shortLinkUpdate: {
                __typename: 'MutationShortLinkUpdateSuccess',
                data: shortLink
              }
            }
          } as unknown as ApolloQueryResult<unknown>)
      )

      await service.updateTeamShortLinks('teamId', 'newDomain')
      expect(ApolloClient.prototype.mutate).toHaveBeenCalledTimes(2)
    })
  })

  describe('updateJourneyShortLink', () => {
    it('updates short link', async () => {
      prismaService.qrCode.findFirst.mockResolvedValue({
        ...qrCode,
        journeyId: 'toJourneyId',
        toJourneyId: 'toJourneyId'
      })
      jest.spyOn(service, 'getTo').mockResolvedValue('to')

      jest.spyOn(ApolloClient.prototype, 'mutate').mockImplementation(
        async () =>
          await Promise.resolve({
            data: {
              shortLinkUpdate: {
                __typename: 'MutationShortLinkUpdateSuccess',
                data: shortLink
              }
            }
          } as unknown as ApolloQueryResult<unknown>)
      )

      await service.updateJourneyShortLink('toJourneyId', 'newJourneySlug')
      expect(ApolloClient.prototype.mutate).toHaveBeenCalledTimes(1)
    })
  })

  describe('parseAndVerifyTo', () => {
    it('returns the journeyId of to', async () => {
      prismaService.customDomain.findMany.mockResolvedValueOnce([])
      prismaService.journey.findFirstOrThrow.mockResolvedValueOnce(toJourney)

      const result = await service.parseAndVerifyTo(
        qrCode,
        'https://your.nextstep.is/journeySlug'
      )
      expect(result).toEqual({
        toJourneyId: 'toJourneyId',
        toBlockId: undefined
      })
    })

    it('returns the journeyId and blockId of to', async () => {
      prismaService.customDomain.findMany.mockResolvedValueOnce([])
      prismaService.journey.findFirstOrThrow.mockResolvedValueOnce(toJourney)
      prismaService.block.findFirstOrThrow.mockResolvedValueOnce(toBlock)

      const result = await service.parseAndVerifyTo(
        qrCode,
        'https://your.nextstep.is/toJourneySlug/toBlockId'
      )
      expect(result).toEqual({
        toJourneyId: 'toJourneyId',
        toBlockId: 'toBlockId'
      })
    })

    it('validates to is a url', async () => {
      await expect(
        service.parseAndVerifyTo(qrCode, 'invalid-journey-url')
      ).rejects.toThrow('Invalid URL')
    })

    it('validates the hostname', async () => {
      prismaService.customDomain.findMany.mockResolvedValueOnce([])

      await expect(
        service.parseAndVerifyTo(qrCode, 'https://invalid.hostname.is')
      ).rejects.toThrow('Invalid hostname')
    })

    it('validates the  custom hostname', async () => {
      prismaService.customDomain.findMany.mockResolvedValueOnce([
        { name: 'custom.domain.is' } as unknown as CustomDomain
      ])

      await expect(
        service.parseAndVerifyTo(qrCode, 'https://your.nextstep.is')
      ).rejects.toThrow('Invalid hostname')
    })

    it('validates the journey', async () => {
      prismaService.customDomain.findMany.mockResolvedValueOnce([])
      prismaService.journey.findFirstOrThrow.mockRejectedValue(
        new Error('Journey not found')
      )

      await expect(
        service.parseAndVerifyTo(qrCode, 'https://your.nextstep.is/journeySlug')
      ).rejects.toThrow('Journey not found')
    })

    it('validates the block', async () => {
      prismaService.customDomain.findMany.mockResolvedValueOnce([])
      prismaService.journey.findFirstOrThrow.mockResolvedValueOnce(journey)
      prismaService.block.findFirstOrThrow.mockRejectedValue(
        new Error('Block not found')
      )

      await expect(
        service.parseAndVerifyTo(
          qrCode,
          'https://your.nextstep.is/toJourneySlug/toBlockId'
        )
      ).rejects.toThrow('Block not found')
    })
  })
})
