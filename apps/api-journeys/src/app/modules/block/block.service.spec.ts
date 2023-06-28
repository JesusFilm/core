import { Test, TestingModule } from '@nestjs/testing'
import { v4 as uuidv4 } from 'uuid'
import { omit } from 'lodash'

import { PrismaService } from '../../lib/prisma.service'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../__generated__/graphql'
import { BlockService, BlockWithAction } from './block.service'

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>

describe('BlockService', () => {
  let service: BlockService, prismaService: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BlockService, PrismaService]
    }).compile()

    service = module.get<BlockService>(BlockService)
    prismaService = module.get<PrismaService>(PrismaService)
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
    fullscreen: true
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
  }
  const cardBlock = {
    typename: 'CardBlock',
    id: 'card',
    journeyId: journey.id,
    parentBlockId: stepBlock.id,
    coverBlockId: 'video'
  }
  const videoBlock = {
    typename: 'VideoBlock',
    id: cardBlock.coverBlockId,
    journeyId: journey.id,
    parentBlockId: cardBlock.id,
    posterBlockId: 'image',
    videoId: 'videoId',
    videoVariantLanguageId: 'videoVariantLanguageId'
  }
  const imageBlock = {
    typename: 'ImageBlock',
    id: videoBlock.posterBlockId,
    journeyId: journey.id,
    parentBlockId: videoBlock.id
  }
  const typographyBlock = {
    typename: 'TypographyBlock',
    id: 'typography',
    journeyId: journey.id,
    parentBlockId: cardBlock.id
  }
  const buttonBlock = {
    typename: 'ButtonBlock',
    id: 'button',
    journeyId: journey.id,
    parentBlockId: cardBlock.id,
    startIconId: null,
    endIconId: 'icon',
    action: { parentBlockId: 'ButtonBlock', blockId: 'step' }
  }
  const iconBlock = {
    typename: 'IconBlock',
    id: buttonBlock.endIconId,
    journeyId: journey.id,
    parentBlockId: buttonBlock.id
  }

  describe('getSiblings', () => {
    it('should return all siblings of a block', async () => {
      prismaService.block.findMany = jest.fn().mockReturnValue([block, block])
      expect(
        await service.getSiblings(block.journeyId, block.parentBlockId)
      ).toEqual([blockResponse, blockResponse])
    })
  })

  describe('save', () => {
    it('should return a saved block', async () => {
      prismaService.block.create = jest.fn().mockReturnValue(block)
      expect(
        await service.save({
          ...omit(block, ['__typename', 'journeyId']),
          typename: 'CardBlock',
          journey: { connect: { id: journey.id } }
        })
      ).toEqual(blockResponse)
    })
  })

  describe('update', () => {
    it('should return an updated block', async () => {
      prismaService.block.update = jest
        .fn()
        .mockResolvedValueOnce(blockResponse)
      expect(await service.update(block.id, block)).toEqual(blockResponse)
    })
  })

  describe('reorderSiblings', () => {
    it('should update parent order', async () => {
      prismaService.block.update = jest
        .fn()
        .mockImplementation((result) => ({ ...block, ...result.data }))

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
      prismaService.block.findUnique = jest.fn().mockReturnValue(block)
      prismaService.block.findMany = jest.fn().mockReturnValue([block, block])
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

      expect(await service.reorderBlock(block.id, journey.id, 1)).toEqual([
        { id: '2', parentOrder: 0 },
        { id: block.id, parentOrder: 1 }
      ])
      expect(service.reorderSiblings).toHaveBeenCalledWith([
        { ...block, id: '2', parentOrder: 1 },
        block
      ])
    })
    it('does not update if block not part of current journey', async () => {
      expect(
        await service.reorderBlock(block.typename, 'invalidJourney', 2)
      ).toEqual([])
      expect(service.reorderSiblings).toBeCalledTimes(0)
    })

    it('does not update if block does not have parent order', async () => {
      prismaService.block.findUnique = jest
        .fn()
        .mockReturnValue({ ...block, parentOrder: null })

      expect(await service.reorderBlock(block.id, journey.id, 2)).toEqual([])
      expect(service.reorderSiblings).toBeCalledTimes(0)
    })
  })

  describe('duplicateBlock', () => {
    const block2 = { ...block, id: '2', parentOrder: 1 }
    const duplicatedBlock = { ...block, id: 'duplicated' }
    const blockChild = {
      id: 'child',
      __typename: 'TypographyBlock',
      parentBlockId: duplicatedBlock.id
    }

    beforeEach(() => {
      prismaService.block.create = jest
        .fn()
        .mockReturnValueOnce(duplicatedBlock)
        .mockReturnValueOnce(blockChild)
      prismaService.block.findMany = jest.fn().mockReturnValue([block, block2])
      prismaService.block.findUnique = jest.fn().mockReturnValue(block)
      prismaService.block.update = jest.fn().mockReturnValue(duplicatedBlock)
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

      expect(await service.duplicateBlock(block.id, journey.id)).toEqual([
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
      await service.duplicateBlock(block.id, journey.id)

      expect(service.reorderSiblings).toHaveBeenCalledWith([
        block,
        block2,
        duplicatedBlock
      ])
    })

    it('should add duplicate block at position specified', async () => {
      await service.duplicateBlock(block.id, journey.id, 1)

      expect(service.reorderSiblings).toHaveBeenCalledWith([
        block,
        duplicatedBlock,
        block2
      ])
    })

    it('should add duplicate block at end if parentOrder exceeds list length', async () => {
      await service.duplicateBlock(block.id, journey.id, 5)

      expect(service.reorderSiblings).toHaveBeenCalledWith([
        block,
        block2,
        duplicatedBlock
      ])
    })

    it('should add duplicate block from end if parentOrder is negative', async () => {
      await service.duplicateBlock(block.id, journey.id, -1)

      expect(service.reorderSiblings).toHaveBeenCalledWith([
        block,
        duplicatedBlock,
        block2
      ])
    })

    it('does not duplicate if block not part of current journey', async () => {
      expect(
        await service.reorderBlock(block.typename, 'invalidJourney', 2)
      ).toEqual([])
      expect(service.reorderSiblings).toBeCalledTimes(0)
    })
  })

  describe('getDuplicateBlockAndChildren', () => {
    beforeEach(() => {
      prismaService.block.findMany = jest.fn().mockReturnValue([])
    })

    it('should return block with randomised id', async () => {
      prismaService.block.findUnique = jest
        .fn()
        .mockReturnValue({ id: 'block' })
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
      expect(prismaService.block.findMany).toBeCalledTimes(1)
    })

    it('should return block with specific id', async () => {
      prismaService.block.findUnique = jest
        .fn()
        .mockReturnValueOnce(stepBlock)
        .mockReturnValueOnce(cardBlock)
        .mockReturnValueOnce(videoBlock)
        .mockReturnValueOnce(buttonBlock)
        .mockReturnValueOnce(imageBlock)
        .mockReturnValueOnce(iconBlock)
      mockUuidv4
        .mockReturnValueOnce(`${cardBlock.id}Copy`)
        .mockReturnValueOnce(`${videoBlock.id}Copy`)
        .mockReturnValueOnce(`${buttonBlock.id}Copy`)
        .mockReturnValueOnce(`${imageBlock.id}Copy`)
        .mockReturnValue(`${iconBlock.id}Copy`)
      prismaService.block.findMany = jest
        .fn()
        .mockReturnValueOnce([cardBlock])
        .mockReturnValueOnce([videoBlock, buttonBlock])
        .mockReturnValueOnce([imageBlock])
        .mockReturnValueOnce([iconBlock])
        .mockReturnValue([])

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

      expect(prismaService.block.findMany).toBeCalledTimes(6)
    })

    it('should return block with updated journeyId & nextBlockId', async () => {
      prismaService.block.findUnique = jest.fn().mockReturnValueOnce(stepBlock)
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

      expect(prismaService.block.findMany).toBeCalledTimes(1)
    })
  })

  describe('getDuplicateChildren', () => {
    it('should return an array of duplicate blocks from array', async () => {
      prismaService.block.findUnique = jest
        .fn()
        .mockReturnValueOnce(stepBlock)
        .mockReturnValueOnce(cardBlock)

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
      prismaService.block.findMany = jest
        .fn()
        .mockResolvedValueOnce([block, block])
        .mockResolvedValueOnce([])
      prismaService.block.deleteMany = jest.fn().mockResolvedValue(null)
      prismaService.action.deleteMany = jest.fn().mockResolvedValue(null)
      prismaService.action.delete = jest.fn().mockResolvedValue(null)
      prismaService.block.delete = jest.fn().mockResolvedValue(block)
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

      expect(
        await service.removeBlockAndChildren(
          block.id,
          journey.id,
          block.parentBlockId
        )
      ).toEqual([
        { id: block.id, parentOrder: 0 },
        { id: block.id, parentOrder: 1 }
      ])
      expect(service.getSiblingsInternal).toHaveBeenCalledWith(
        journey.id,
        block.parentBlockId
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
    prismaService.block.update = jest.fn().mockReturnValue(block)
    const siblings = [block as BlockWithAction, block as BlockWithAction]

    service.getSiblingsInternal = jest.fn().mockResolvedValue(siblings)
    expect(await service.reorderSiblings(siblings)).toEqual([
      { id: block.id, parentOrder: 0 },
      { id: block.id, parentOrder: 1 }
    ])
  })

  describe('validateBlock', () => {
    beforeEach(() => {
      prismaService.block.findUnique = jest.fn().mockReturnValue(block)
    })
    it('should return false with non-existent id', async () => {
      expect(await service.validateBlock(null, '1')).toEqual(false)
    })
    it('should return false with incorrect parent id', async () => {
      expect(await service.validateBlock('1', 'wrongParent')).toEqual(false)
    })
    it('should validate block against parentBlockId', async () => {
      expect(await service.validateBlock('1', '3', 'parentBlockId')).toEqual(
        true
      )
    })

    it('should validate block against journeyId', async () => {
      expect(await service.validateBlock('1', journey.id, 'journeyId')).toEqual(
        true
      )
    })

    it('should return false with incorrect journey id', async () => {
      expect(
        await service.validateBlock('1', 'wrongJourney', 'journeyId')
      ).toEqual(false)
    })
  })
})
