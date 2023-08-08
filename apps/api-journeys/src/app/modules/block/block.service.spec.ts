import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import omit from 'lodash/omit'
import { v4 as uuidv4 } from 'uuid'

import { Action, Block, Prisma } from '.prisma/api-journeys-client'

import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'

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
        }
      ]
    }).compile()

    service = module.get<BlockService>(BlockService)
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
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
    action: null
  } as unknown as BlockWithAction

  const blockWithAction = {
    ...block,
    action: null
  }

  const blockResponse = {
    ...omit(block, ['typename']),
    __typename: block.typename
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
    action: { parentBlockId: 'ButtonBlock', blockId: 'step' }
  } as unknown as BlockWithAction
  const iconBlock = {
    typename: 'IconBlock',
    id: buttonBlock.endIconId,
    journeyId: journey.id,
    parentBlockId: buttonBlock.id
  } as unknown as Block

  describe('getSiblings', () => {
    it('should return all siblings of a block', async () => {
      prismaService.block.findMany.mockResolvedValue([block, block])
      expect(
        await service.getSiblings(block.journeyId, block.parentBlockId)
      ).toEqual([blockResponse, blockResponse])
    })
  })

  describe('save', () => {
    it('should return a saved block', async () => {
      prismaService.block.create.mockResolvedValue(block)
      expect(
        await service.save({
          data: {
            ...omit(
              block,
              '__typename',
              'journeyId',
              'parentBlockId',
              'coverBlockId',
              'nextBlockId',
              'posterBlockId',
              'action'
            ),
            typename: 'CardBlock',
            journey: { connect: { id: journey.id } }
          }
        })
      ).toEqual(blockResponse)
    })
  })

  describe('update', () => {
    it('should return an updated block', async () => {
      prismaService.block.update.mockResolvedValueOnce(block)
      expect(await service.update(block.id, { title: 'test' })).toEqual(
        blockResponse
      )
      expect(prismaService.block.update).toHaveBeenCalledWith({
        data: {
          title: 'test'
        },
        include: {
          action: true
        },
        where: {
          id: '1'
        }
      })
    })
  })

  describe('reorderSiblings', () => {
    it('should update parent order', async () => {
      prismaService.block.update.mockImplementation((result) => {
        return {
          ...block,
          ...result.data
        } as unknown as Prisma.Prisma__BlockClient<Block>
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
        .mockReturnValue([block, { ...block, id: '2', parentOrder: 1 }])

      expect(await service.reorderBlock(blockWithAction, 1)).toEqual([
        { id: '2', parentOrder: 0 },
        { id: block.id, parentOrder: 1 }
      ])
      expect(service.reorderSiblings).toHaveBeenCalledWith([
        { ...block, id: '2', parentOrder: 1 },
        blockWithAction
      ])
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

  describe('duplicateBlock', () => {
    const block2 = { ...block, id: '2', parentOrder: 1 }
    const duplicatedBlock = { ...block, id: 'duplicated' }
    const blockChild = {
      id: 'child',
      __typename: 'TypographyBlock',
      parentBlockId: duplicatedBlock.id
    } as unknown as Block

    beforeEach(() => {
      prismaService.block.create
        .mockResolvedValueOnce(duplicatedBlock)
        .mockResolvedValueOnce(blockChild)
      prismaService.block.findMany.mockResolvedValue([block, block2])
      prismaService.block.findUnique.mockResolvedValue(block)
      prismaService.block.update
        .mockResolvedValueOnce(duplicatedBlock)
        .mockResolvedValueOnce(blockChild)
        .mockResolvedValueOnce(block2)
      service.getSiblingsInternal = jest
        .fn()
        .mockReturnValue([block, duplicatedBlock, block2])
      service.getDuplicateBlockAndChildren = jest
        .fn()
        .mockReturnValue([duplicatedBlock, blockChild])
      service.reorderSiblings = jest.fn().mockReturnValue([])
    })

    it('should return the duplicated block, its siblings and children', async () => {
      const blockAndSiblings = [
        block,
        { ...block, id: block2.id },
        { ...duplicatedBlock, parentOrder: '2' }
      ]

      service.reorderSiblings = jest.fn().mockReturnValue(blockAndSiblings)

      expect(await service.duplicateBlock(block)).toEqual([
        blockResponse,
        { ...blockResponse, id: block2.id },
        {
          ...omit(duplicatedBlock, 'typename'),
          __typename: duplicatedBlock.typename,
          parentOrder: '2'
        },
        blockChild
      ])
    })

    it('should add duplicated block at end by default', async () => {
      await service.duplicateBlock(block)

      expect(service.reorderSiblings).toHaveBeenCalledWith([
        block,
        block2,
        duplicatedBlock
      ])
    })

    it('should add duplicate block at position specified', async () => {
      await service.duplicateBlock(block, 1)

      expect(service.reorderSiblings).toHaveBeenCalledWith([
        block,
        duplicatedBlock,
        block2
      ])
    })

    it('should add duplicate block at end if parentOrder exceeds list length', async () => {
      await service.duplicateBlock(block, 5)

      expect(service.reorderSiblings).toHaveBeenCalledWith([
        block,
        block2,
        duplicatedBlock
      ])
    })

    it('should add duplicate block from end if parentOrder is negative', async () => {
      await service.duplicateBlock(block, -1)

      expect(service.reorderSiblings).toHaveBeenCalledWith([
        block,
        duplicatedBlock,
        block2
      ])
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
          cardBlock.id
        )
      ).toEqual([
        {
          id: `${typographyBlock.id}Copy`,
          parentBlockId: cardBlock.id
        }
      ])
      expect(prismaService.block.findMany).toHaveBeenCalledTimes(1)
    })

    it('should return block with specific id', async () => {
      prismaService.block.findUnique
        .mockResolvedValueOnce(stepBlock)
        .mockResolvedValueOnce(cardBlock)
        .mockResolvedValueOnce(videoBlock)
        .mockResolvedValueOnce(buttonBlock)
        .mockResolvedValueOnce(imageBlock)
        .mockResolvedValueOnce(iconBlock)
      mockUuidv4
        .mockReturnValueOnce(`${cardBlock.id}Copy`)
        .mockReturnValueOnce(`${videoBlock.id}Copy`)
        .mockReturnValueOnce(`${buttonBlock.id}Copy`)
        .mockReturnValueOnce(`${imageBlock.id}Copy`)
        .mockReturnValue(`${iconBlock.id}Copy`)
      prismaService.block.findMany
        .mockResolvedValueOnce([cardBlock])
        .mockResolvedValueOnce([videoBlock, buttonBlock])
        .mockResolvedValueOnce([imageBlock])
        .mockResolvedValueOnce([iconBlock])
        .mockResolvedValue([])

      // StepBlock uses specific id. Child block id's, parentBlockIds & unique block ids (coverBlockId, posterBlockId & iconIds) are randomised
      // Actions remain the same & nextBlockId is made null
      expect(
        await service.getDuplicateBlockAndChildren(
          stepBlock.id,
          journey.id,
          null,
          'specificStepId'
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
          id: `${cardBlock.id}Copy`,
          parentBlockId: 'specificStepId',
          coverBlockId: `${videoBlock.id}Copy`
        },
        {
          ...videoBlock,
          id: `${videoBlock.id}Copy`,
          parentBlockId: `${cardBlock.id}Copy`,
          posterBlockId: `${imageBlock.id}Copy`
        },
        {
          ...imageBlock,
          id: `${imageBlock.id}Copy`,
          parentBlockId: `${videoBlock.id}Copy`
        },
        {
          ...buttonBlock,
          id: `${buttonBlock.id}Copy`,
          parentBlockId: `${cardBlock.id}Copy`,
          endIconId: `${iconBlock.id}Copy`,
          action: omit(buttonBlock.action, 'parentBlockId')
        },
        {
          ...iconBlock,
          id: `${iconBlock.id}Copy`,
          parentBlockId: `${buttonBlock.id}Copy`
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
  })

  describe('getDuplicateChildren', () => {
    it('should return an array of duplicate blocks from array', async () => {
      prismaService.block.findUnique
        .mockResolvedValueOnce(stepBlock)
        .mockResolvedValueOnce(cardBlock)

      service.getDuplicateBlockAndChildren = jest
        .fn()
        .mockReturnValueOnce([{ block: 'duplicateStepBlock' }])
        .mockReturnValue([])

      const duplicateStepIds = new Map([[stepBlock.id, 'step1']])

      expect(
        await service.getDuplicateChildren(
          [stepBlock as BlockWithAction],
          '1',
          null,
          duplicateStepIds,
          'journey2',
          duplicateStepIds
        )
      ).toEqual([
        {
          block: 'duplicateStepBlock'
        }
      ])

      expect(service.getDuplicateBlockAndChildren).toHaveBeenCalledWith(
        stepBlock.id,
        '1',
        null,
        'step1',
        'journey2',
        duplicateStepIds
      )
    })
  })

  describe('removeBlockAndChildren', () => {
    beforeEach(() => {
      prismaService.block.findMany
        .mockResolvedValueOnce([block, block])
        .mockResolvedValueOnce([])
      prismaService.block.delete.mockResolvedValue(block)
    })

    it('should remove blocks and return siblings', async () => {
      service.getSiblingsInternal = jest.fn().mockResolvedValue([
        { id: block.id, parentOrder: 1 },
        { id: block.id, parentOrder: 2 }
      ])
      service.reorderSiblings = jest.fn().mockResolvedValue([
        { id: block.id, parentOrder: 0 },
        { id: block.id, parentOrder: 1 }
      ])

      expect(await service.removeBlockAndChildren(block)).toEqual([
        { id: block.id, parentOrder: 0 },
        { id: block.id, parentOrder: 1 }
      ])
      expect(service.getSiblingsInternal).toHaveBeenCalledWith(
        journey.id,
        block.parentBlockId,
        prismaService
      )
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

    it('should return false with incorrect journey id', async () => {
      expect(
        await service.validateBlock('1', 'wrongJourney', 'journeyId')
      ).toBe(false)
    })
  })
})
