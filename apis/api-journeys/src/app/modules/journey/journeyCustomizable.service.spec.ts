import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { PrismaService } from '../../lib/prisma.service'

import { JourneyCustomizableService } from './journeyCustomizable.service'

describe('JourneyCustomizableService', () => {
  let service: JourneyCustomizableService
  let prismaService: DeepMockProxy<PrismaService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JourneyCustomizableService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()

    service = module.get<JourneyCustomizableService>(JourneyCustomizableService)
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
  })

  const baseJourney = {
    template: true,
    customizable: false,
    journeyCustomizationDescription: null,
    logoImageBlockId: null,
    website: null,
    _count: { journeyCustomizationFields: 0 }
  }

  describe('recalculate', () => {
    it('should early return if journey not found', async () => {
      prismaService.journey.findUnique.mockResolvedValueOnce(null)
      await service.recalculate('non-existent')
      expect(prismaService.block.findMany).not.toHaveBeenCalled()
      expect(prismaService.journey.update).not.toHaveBeenCalled()
    })

    it('should early return for non-template journeys', async () => {
      prismaService.journey.findUnique.mockResolvedValueOnce({
        ...baseJourney,
        template: false
      } as any)
      await service.recalculate('journeyId')
      expect(prismaService.block.findMany).not.toHaveBeenCalled()
      expect(prismaService.journey.update).not.toHaveBeenCalled()
    })

    it('should set customizable to true when has editable text fields', async () => {
      prismaService.journey.findUnique.mockResolvedValueOnce({
        ...baseJourney,
        journeyCustomizationDescription: 'Hello {{ name: John }}!',
        _count: { journeyCustomizationFields: 1 }
      } as any)
      prismaService.block.findMany.mockResolvedValueOnce([])

      await service.recalculate('journeyId')

      expect(prismaService.journey.update).toHaveBeenCalledWith({
        where: { id: 'journeyId' },
        data: { customizable: true }
      })
    })

    it('should not count editable text when description is empty', async () => {
      prismaService.journey.findUnique.mockResolvedValueOnce({
        ...baseJourney,
        journeyCustomizationDescription: '',
        _count: { journeyCustomizationFields: 1 }
      } as any)
      prismaService.block.findMany.mockResolvedValueOnce([])

      await service.recalculate('journeyId')

      expect(prismaService.journey.update).not.toHaveBeenCalled()
    })

    it('should not count editable text when fields count is 0', async () => {
      prismaService.journey.findUnique.mockResolvedValueOnce({
        ...baseJourney,
        journeyCustomizationDescription: 'Has description'
      } as any)
      prismaService.block.findMany.mockResolvedValueOnce([])

      await service.recalculate('journeyId')

      expect(prismaService.journey.update).not.toHaveBeenCalled()
    })

    it('should set customizable to true when has customizable link action', async () => {
      prismaService.journey.findUnique.mockResolvedValueOnce(baseJourney as any)
      prismaService.block.findMany.mockResolvedValueOnce([
        {
          id: 'buttonId',
          typename: 'ButtonBlock',
          customizable: false,
          action: {
            parentBlockId: 'buttonId',
            customizable: true,
            blockId: null,
            url: 'https://example.com'
          }
        }
      ] as any)

      await service.recalculate('journeyId')

      expect(prismaService.journey.update).toHaveBeenCalledWith({
        where: { id: 'journeyId' },
        data: { customizable: true }
      })
    })

    it('should not count NavigateToBlockAction as customizable link', async () => {
      prismaService.journey.findUnique.mockResolvedValueOnce(baseJourney as any)
      prismaService.block.findMany.mockResolvedValueOnce([
        {
          id: 'buttonId',
          typename: 'ButtonBlock',
          customizable: false,
          action: {
            parentBlockId: 'buttonId',
            customizable: true,
            blockId: 'stepBlockId',
            url: null
          }
        }
      ] as any)

      await service.recalculate('journeyId')

      expect(prismaService.journey.update).not.toHaveBeenCalled()
    })

    it('should set customizable to true when has customizable ImageBlock', async () => {
      prismaService.journey.findUnique.mockResolvedValueOnce(baseJourney as any)
      prismaService.block.findMany.mockResolvedValueOnce([
        {
          id: 'imageId',
          typename: 'ImageBlock',
          customizable: true,
          action: null
        }
      ] as any)

      await service.recalculate('journeyId')

      expect(prismaService.journey.update).toHaveBeenCalledWith({
        where: { id: 'journeyId' },
        data: { customizable: true }
      })
    })

    it('should set customizable to true when has customizable VideoBlock', async () => {
      prismaService.journey.findUnique.mockResolvedValueOnce(baseJourney as any)
      prismaService.block.findMany.mockResolvedValueOnce([
        {
          id: 'videoId',
          typename: 'VideoBlock',
          customizable: true,
          action: null
        }
      ] as any)

      await service.recalculate('journeyId')

      expect(prismaService.journey.update).toHaveBeenCalledWith({
        where: { id: 'journeyId' },
        data: { customizable: true }
      })
    })

    it('should count logo as customizable media when website is true', async () => {
      prismaService.journey.findUnique.mockResolvedValueOnce({
        ...baseJourney,
        website: true,
        logoImageBlockId: 'logoId'
      } as any)
      prismaService.block.findMany.mockResolvedValueOnce([
        {
          id: 'logoId',
          typename: 'ImageBlock',
          customizable: true,
          action: null
        }
      ] as any)

      await service.recalculate('journeyId')

      expect(prismaService.journey.update).toHaveBeenCalledWith({
        where: { id: 'journeyId' },
        data: { customizable: true }
      })
    })

    it('should not count logo as customizable media when website is false', async () => {
      prismaService.journey.findUnique.mockResolvedValueOnce({
        ...baseJourney,
        website: false,
        logoImageBlockId: 'logoId'
      } as any)
      prismaService.block.findMany.mockResolvedValueOnce([
        {
          id: 'logoId',
          typename: 'ImageBlock',
          customizable: true,
          action: null
        }
      ] as any)

      await service.recalculate('journeyId')

      expect(prismaService.journey.update).not.toHaveBeenCalled()
    })

    it('should exclude logo block from general ImageBlock check', async () => {
      prismaService.journey.findUnique.mockResolvedValueOnce({
        ...baseJourney,
        website: false,
        logoImageBlockId: 'logoId'
      } as any)
      prismaService.block.findMany.mockResolvedValueOnce([
        {
          id: 'logoId',
          typename: 'ImageBlock',
          customizable: true,
          action: null
        }
      ] as any)

      await service.recalculate('journeyId')

      // Logo is the only customizable block but website is false,
      // and it's excluded from the general media check
      expect(prismaService.journey.update).not.toHaveBeenCalled()
    })

    it('should set customizable to false when no customizable content', async () => {
      prismaService.journey.findUnique.mockResolvedValueOnce({
        ...baseJourney,
        customizable: true
      } as any)
      prismaService.block.findMany.mockResolvedValueOnce([
        {
          id: 'imageId',
          typename: 'ImageBlock',
          customizable: false,
          action: null
        }
      ] as any)

      await service.recalculate('journeyId')

      expect(prismaService.journey.update).toHaveBeenCalledWith({
        where: { id: 'journeyId' },
        data: { customizable: false }
      })
    })

    it('should not update when value unchanged', async () => {
      prismaService.journey.findUnique.mockResolvedValueOnce({
        ...baseJourney,
        customizable: false
      } as any)
      prismaService.block.findMany.mockResolvedValueOnce([])

      await service.recalculate('journeyId')

      expect(prismaService.journey.update).not.toHaveBeenCalled()
    })

    it('should detect customizable RadioOptionBlock action', async () => {
      prismaService.journey.findUnique.mockResolvedValueOnce(baseJourney as any)
      prismaService.block.findMany.mockResolvedValueOnce([
        {
          id: 'radioId',
          typename: 'RadioOptionBlock',
          customizable: false,
          action: {
            parentBlockId: 'radioId',
            customizable: true,
            blockId: null,
            url: 'https://example.com'
          }
        }
      ] as any)

      await service.recalculate('journeyId')

      expect(prismaService.journey.update).toHaveBeenCalledWith({
        where: { id: 'journeyId' },
        data: { customizable: true }
      })
    })

    it('should detect customizable VideoTriggerBlock action', async () => {
      prismaService.journey.findUnique.mockResolvedValueOnce(baseJourney as any)
      prismaService.block.findMany.mockResolvedValueOnce([
        {
          id: 'triggerId',
          typename: 'VideoTriggerBlock',
          customizable: false,
          action: {
            parentBlockId: 'triggerId',
            customizable: true,
            blockId: null,
            url: 'https://example.com'
          }
        }
      ] as any)

      await service.recalculate('journeyId')

      expect(prismaService.journey.update).toHaveBeenCalledWith({
        where: { id: 'journeyId' },
        data: { customizable: true }
      })
    })

    it('should handle null customizable on journey as false', async () => {
      prismaService.journey.findUnique.mockResolvedValueOnce({
        ...baseJourney,
        customizable: null
      } as any)
      prismaService.block.findMany.mockResolvedValueOnce([])

      await service.recalculate('journeyId')

      // null treated as false, no change needed
      expect(prismaService.journey.update).not.toHaveBeenCalled()
    })
  })
})
