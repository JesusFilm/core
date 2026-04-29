import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import omit from 'lodash/omit'
import { v4 as uuidv4 } from 'uuid'

import { Action, Block } from '@core/prisma/journeys/client'

import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'
import { JourneyCustomizableService } from '../journey/journeyCustomizable.service'

import { BlockService } from './block.service'

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>
type BlockWithAction = Block & { action: Action | null }

describe('BlockService', () => {
  let service: BlockService, prismaService: DeepMockProxy<PrismaService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlockService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        },
        {
          provide: JourneyCustomizableService,
          useValue: mockDeep<JourneyCustomizableService>()
        }
      ]
    }).compile()

    service = module.get<BlockService>(BlockService)
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
    prismaService.$transaction.mockImplementation(
      async (callback) => await callback(prismaService)
    )
  })

  afterAll(() => {
    jest.resetAllMocks()
  })

  const journey = {
    id: '1',
    title: 'published',
    createdAt: new Date(),
    status: JourneyStatus.published,
    languageId: '529',
    themeMode: ThemeMode.light,
    themeName: ThemeName.base,
    description: null,
    primaryImageBlockId: null,
    slug: 'published-slug',
    teamId: 'teamId',
    chatButtons: []
  }

  const block = {
    id: '1',
    journeyId: journey.id,
    typename: 'CardBlock',
    parentBlockId: '3',
    parentOrder: 0,
    backgroundColor: '#FFF',
    coverBlockId: '4',
    themeMode: ThemeMode.light,
    themeName: ThemeName.base,
    fullscreen: true,
    action: null,
    updatedAt: '2024-10-21T04:32:25.858Z'
  } as unknown as BlockWithAction

  const blockWithAction = {
    ...block,
    action: null
  }

  const stepBlock = {
    typename: 'StepBlock',
    id: 'step',
    journeyId: journey.id,
    parentBlockId: null,
    nextBlockId: 'someId'
  } as unknown as Block
  const cardBlock = {
    typename: 'CardBlock',
    id: 'card',
    journeyId: journey.id,
    parentBlockId: stepBlock.id,
    coverBlockId: 'video'
  } as unknown as Block
  const videoBlock = {
    typename: 'VideoBlock',
    id: cardBlock.coverBlockId,
    journeyId: journey.id,
    parentBlockId: cardBlock.id,
    posterBlockId: 'image',
    videoId: 'videoId',
    videoVariantLanguageId: 'videoVariantLanguageId'
  } as unknown as Block
  const imageBlock = {
    typename: 'ImageBlock',
    id: videoBlock.posterBlockId,
    journeyId: journey.id,
    parentBlockId: videoBlock.id
  } as unknown as Block
  const typographyBlock = {
    typename: 'TypographyBlock',
    id: 'typography',
    journeyId: journey.id,
    parentBlockId: cardBlock.id
  } as unknown as Block
  const buttonBlock = {
    typename: 'ButtonBlock',
    id: 'button',
    journeyId: journey.id,
    parentBlockId: cardBlock.id,
    startIconId: null,
    endIconId: 'icon',
    submitEnabled: true,
    action: { parentBlockId: 'ButtonBlock', blockId: 'step' }
  } as unknown as BlockWithAction
  const iconBlock = {
    typename: 'IconBlock',
    id: buttonBlock.endIconId,
    journeyId: journey.id,
    parentBlockId: buttonBlock.id
  } as unknown as Block

  describe('reorderSiblings', () => {
    it('should update parent order', async () => {
      prismaService.block.update.mockResolvedValueOnce({
        ...block,
        parentOrder: 0
      })
      prismaService.block.update.mockResolvedValueOnce({
        ...block,
        parentOrder: 1
      })
      expect(
        await service.reorderSiblings([
          { ...block, parentOrder: 2 } as unknown as BlockWithAction,
          { ...block, parentOrder: 3 } as unknown as BlockWithAction
        ])
      ).toEqual([
        { ...block, parentOrder: 0 },
        { ...block, parentOrder: 1 }
      ])
      expect(prismaService.block.update).toHaveBeenCalledWith({
        where: { id: block.id },
        data: { parentOrder: 0 },
        include: { action: true }
      })
      expect(prismaService.block.update).toHaveBeenCalledWith({
        where: { id: block.id },
        data: { parentOrder: 1 },
        include: { action: true }
      })
    })
  })

  describe('reorderBlock', () => {
    beforeEach(() => {
      prismaService.block.findMany.mockResolvedValue([block, block])
      service.reorderSiblings = jest.fn(
        async () =>
          await Promise.resolve([
            { id: '2', parentOrder: 0 } as unknown as BlockWithAction,
            { id: block.id, parentOrder: 1 } as unknown as BlockWithAction
          ])
      )
    })

    it('should update block order', async () => {
      service.getSiblingsInternal = jest
        .fn()
        .mockReturnValue([{ ...block, id: '2', parentOrder: 1 }])

      expect(await service.reorderBlock(blockWithAction, 1)).toEqual([
        { id: '2', parentOrder: 0 },
        { id: block.id, parentOrder: 1 }
      ])
      expect(service.reorderSiblings).toHaveBeenCalledWith(
        [{ ...block, id: '2', parentOrder: 1 }, blockWithAction],
        prismaService
      )
    })

    it('does not update if block does not have parent order', async () => {
      expect(
        await service.reorderBlock(
          {
            ...block,
            parentOrder: null
          },
          2
        )
      ).toEqual([])
      expect(service.reorderSiblings).toHaveBeenCalledTimes(0)
    })
  })

  describe('getDuplicateBlockAndChildren', () => {
    beforeEach(() => {
      prismaService.block.findMany.mockResolvedValue([])
    })

    it('should return block with randomised id', async () => {
      prismaService.block.findUnique.mockResolvedValue({
        id: 'block'
      } as unknown as Block)
      mockUuidv4.mockReturnValueOnce(`${typographyBlock.id}Copy`)

      expect(
        await service.getDuplicateBlockAndChildren(
          typographyBlock.id,
          '1',
          cardBlock.id,
          false
        )
      ).toEqual([
        {
          id: `${typographyBlock.id}Copy`,
          parentBlockId: cardBlock.id
        }
      ])
      expect(prismaService.block.findMany).toHaveBeenCalledTimes(1)
      expect(prismaService.block.findUnique).toHaveBeenCalledWith({
        where: { id: 'typography', deletedAt: null },
        include: { action: true }
      })
    })

    it('should return block and children with specific ids', async () => {
      prismaService.block.findUnique
        .mockResolvedValueOnce(stepBlock)
        .mockResolvedValueOnce(cardBlock)
        .mockResolvedValueOnce(videoBlock)
        .mockResolvedValueOnce(buttonBlock)
        .mockResolvedValueOnce(imageBlock)
        .mockResolvedValueOnce(iconBlock)

      prismaService.block.findMany
        .mockResolvedValueOnce([cardBlock])
        .mockResolvedValueOnce([videoBlock, buttonBlock])
        .mockResolvedValueOnce([imageBlock])
        .mockResolvedValueOnce([iconBlock])
        .mockResolvedValue([])

      expect(
        await service.getDuplicateBlockAndChildren(
          stepBlock.id,
          journey.id,
          null,
          true,
          'specificStepId',
          [
            { oldId: stepBlock.id, newId: 'specificStepId' },
            { oldId: cardBlock.id, newId: 'specificCardId' },
            { oldId: videoBlock.id, newId: 'specificVideoId' },
            { oldId: imageBlock.id, newId: 'specificImageId' },
            { oldId: buttonBlock.id, newId: 'specificButtonId' },
            { oldId: iconBlock.id, newId: 'specificIconId' }
          ]
        )
      ).toEqual([
        {
          ...stepBlock,
          id: 'specificStepId',
          parentBlockId: null,
          nextBlockId: null
        },
        {
          ...cardBlock,
          id: 'specificCardId',
          parentBlockId: 'specificStepId',
          coverBlockId: 'specificVideoId'
        },
        {
          ...videoBlock,
          id: 'specificVideoId',
          parentBlockId: 'specificCardId',
          posterBlockId: 'specificImageId'
        },
        {
          ...imageBlock,
          id: 'specificImageId',
          parentBlockId: 'specificVideoId'
        },
        {
          ...buttonBlock,
          id: 'specificButtonId',
          parentBlockId: 'specificCardId',
          endIconId: 'specificIconId',
          submitEnabled: true,
          action: omit(buttonBlock.action, 'parentBlockId')
        },
        {
          ...iconBlock,
          id: 'specificIconId',
          parentBlockId: 'specificButtonId'
        }
      ])

      expect(prismaService.block.findMany).toHaveBeenCalledTimes(6)
    })

    it('should return block with updated journeyId & nextBlockId', async () => {
      prismaService.block.findUnique.mockResolvedValueOnce(stepBlock)
      const duplicateStepIds = new Map()
      duplicateStepIds.set(stepBlock.nextBlockId, 'duplicateStepId')
      mockUuidv4.mockReturnValueOnce(`${stepBlock.id}Copy`)

      expect(
        await service.getDuplicateBlockAndChildren(
          buttonBlock.id,
          journey.id,
          cardBlock.id,
          false,
          undefined,
          undefined,
          'journey2',
          duplicateStepIds
        )
      ).toEqual([
        {
          ...stepBlock,
          id: `${stepBlock.id}Copy`,
          journeyId: 'journey2',
          parentBlockId: cardBlock.id,
          nextBlockId: 'duplicateStepId'
        }
      ])

      expect(prismaService.block.findMany).toHaveBeenCalledTimes(1)
    })

    it('should disable submit buttons when duplicating blocks within same journey', async () => {
      prismaService.block.findUnique.mockResolvedValue(buttonBlock)
      mockUuidv4.mockReturnValueOnce(`${buttonBlock.id}Copy`)

      const result = await service.getDuplicateBlockAndChildren(
        buttonBlock.id,
        journey.id,
        cardBlock.id,
        false
      )

      expect(result[0].submitEnabled).toBe(false)
    })
  })

  it('should update parent order', async () => {
    service.reorderSiblings = jest.fn(
      async () =>
        await Promise.resolve([
          { id: block.id, parentOrder: 0 } as unknown as BlockWithAction,
          { id: block.id, parentOrder: 1 } as unknown as BlockWithAction
        ])
    )
    prismaService.block.update.mockResolvedValue(block)
    const siblings = [block, block]

    service.getSiblingsInternal = jest.fn().mockResolvedValue(siblings)
    expect(await service.reorderSiblings(siblings)).toEqual([
      { id: block.id, parentOrder: 0 },
      { id: block.id, parentOrder: 1 }
    ])
  })

  describe('validateBlock', () => {
    beforeEach(() => {
      prismaService.block.findUnique.mockResolvedValue(block)
    })

    it('should return false with non-existent id', async () => {
      expect(await service.validateBlock(null, '1')).toBe(false)
    })

    it('should return false with incorrect parent id', async () => {
      expect(await service.validateBlock('1', 'wrongParent')).toBe(false)
    })

    it('should validate block against parentBlockId', async () => {
      expect(await service.validateBlock('1', '3', 'parentBlockId')).toBe(true)
    })

    it('should validate block against journeyId', async () => {
      expect(await service.validateBlock('1', journey.id, 'journeyId')).toBe(
        true
      )
    })

    it('should get block that is not deleted', async () => {
      expect(await service.validateBlock('1', journey.id, 'journeyId')).toBe(
        true
      )
      expect(prismaService.block.findUnique).toHaveBeenCalledWith({
        where: { id: '1', deletedAt: null },
        include: { action: true }
      })
    })

    it('should return false with incorrect journey id', async () => {
      expect(
        await service.validateBlock('1', 'wrongJourney', 'journeyId')
      ).toBe(false)
    })
  })

  describe('removeDescendantsOfDeletedBlocks', () => {
    const videoBlock2 = {
      typename: 'VideoBlock',
      id: 'video2',
      journeyId: journey.id,
      parentBlockId: 'deletedCard',
      posterBlockId: 'image',
      videoId: 'videoId',
      videoVariantLanguageId: 'videoVariantLanguageId'
    } as unknown as Block

    const typographyBlock2 = {
      typename: 'TypographyBlock',
      id: 'typography2',
      journeyId: journey.id,
      parentBlockId: 'deletedCard'
    } as unknown as Block

    const buttonBlock2 = {
      typename: 'ButtonBlock',
      id: 'button2',
      journeyId: journey.id,
      parentBlockId: 'deletedCard',
      startIconId: null,
      endIconId: 'icon',
      action: { parentBlockId: 'ButtonBlock', blockId: 'step' }
    } as unknown as BlockWithAction

    it('should filter out all blocks where the parent block has been deleted', async () => {
      const blocks = [
        stepBlock,
        videoBlock,
        imageBlock,
        cardBlock,
        typographyBlock,
        buttonBlock,
        iconBlock,
        videoBlock2,
        typographyBlock2,
        buttonBlock2
      ]

      const res = await service.removeDescendantsOfDeletedBlocks(
        blocks as BlockWithAction[]
      )
      expect(res).toHaveLength(7)
    })
  })

  describe('getDescendants', () => {
    it('should get descendants of a block', async () => {
      const blocks = [
        stepBlock,
        videoBlock,
        imageBlock,
        cardBlock,
        typographyBlock,
        buttonBlock,
        iconBlock
      ]
      expect(await service.getDescendants(stepBlock.id, blocks)).toEqual([
        cardBlock,
        videoBlock,
        imageBlock,
        typographyBlock,
        buttonBlock,
        iconBlock
      ])
    })
  })
})
