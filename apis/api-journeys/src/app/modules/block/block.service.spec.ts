import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import omit from 'lodash/omit'
import { v4 as uuidv4 } from 'uuid'

import { Action, Block } from '.prisma/api-journeys-client'

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
    submitEnabled: true,
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
      expect(prismaService.block.findMany).toHaveBeenCalledWith({
        where: {
          journeyId: '1',
          parentBlockId: '3',
          parentOrder: { not: null },
          deletedAt: null
        },
        orderBy: { parentOrder: 'asc' },
        include: { action: true }
      })
    })

    it('should return all siblings of a block without the parentId', async () => {
      prismaService.block.findMany.mockResolvedValue([block, block])
      expect(await service.getSiblings(block.journeyId)).toEqual([
        blockResponse,
        blockResponse
      ])
      expect(prismaService.block.findMany).toHaveBeenCalledWith({
        where: {
          journeyId: '1',
          parentOrder: { not: null },
          deletedAt: null,
          typename: 'StepBlock'
        },
        orderBy: { parentOrder: 'asc' },
        include: { action: true }
      })
    })
  })

  describe('setJourneyUpdatedAt', () => {
    it('should set the journey of updatedAt of the block', async () => {
      await service.setJourneyUpdatedAt(prismaService, block)
      expect(prismaService.journey.update).toHaveBeenCalledWith({
        where: {
          id: block.journeyId
        },
        data: {
          updatedAt: block.updatedAt
        }
      })
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
              'action',
              'pollOptionImageId',
              'pollOptionImageBlockId'
            ),
            typename: 'CardBlock',
            journey: { connect: { id: journey.id } },
            settings: {}
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

    it('should not update deletedAt prop', async () => {
      prismaService.block.update.mockResolvedValueOnce(block)
      expect(
        await service.update(block.id, {
          title: 'test',
          deletedAt: new Date()
        })
      ).toEqual(blockResponse)
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

    it('should update journey updatedAt when block is updated', async () => {
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
      expect(prismaService.journey.update).toHaveBeenCalledWith({
        data: {
          updatedAt: block.updatedAt
        },
        where: {
          id: block.journeyId
        }
      })
    })
  })

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

  describe('duplicateBlock', () => {
    const block2 = { ...block, id: '2', parentOrder: 1 }
    const duplicatedBlock = { ...block, id: 'duplicated' }
    const blockChild = {
      id: 'child',
      __typename: 'TypographyBlock',
      parentBlockId: duplicatedBlock.id,
      settings: {
        __typename: 'TypographyBlockSettings',
        color: null
      }
    } as unknown as Block

    beforeEach(() => {
      prismaService.block.create
        .mockResolvedValueOnce(duplicatedBlock)
        .mockResolvedValueOnce(blockChild)
      prismaService.block.findMany.mockResolvedValue([block, block2])
      prismaService.block.findUnique.mockResolvedValue(block)

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
      prismaService.block.update
        .mockResolvedValueOnce(duplicatedBlock)
        .mockResolvedValueOnce(blockChild)
        .mockResolvedValueOnce(block2)

      service.reorderSiblings = jest.fn().mockReturnValue(blockAndSiblings)

      expect(await service.duplicateBlock(block, false)).toEqual([
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

    it('should return the duplicated block, its siblings and children with custom ids', async () => {
      const blockAndSiblings = [
        block,
        { ...block, id: block2.id },
        { ...duplicatedBlock, parentOrder: '2', id: 'newBlockId' }
      ]
      service.reorderSiblings = jest.fn().mockReturnValue(blockAndSiblings)
      service.getDuplicateBlockAndChildren = jest
        .fn()
        .mockReturnValue([{ ...duplicatedBlock, id: 'newBlockId' }, blockChild])
      prismaService.block.update
        .mockResolvedValueOnce({ ...duplicatedBlock, id: 'newBlockId' })
        .mockResolvedValueOnce(blockChild)

      expect(
        await service.duplicateBlock(block, false, undefined, [
          { oldId: block.id, newId: 'newBlockId' }
        ])
      ).toEqual([
        blockResponse,
        { ...blockResponse, id: block2.id },
        {
          ...omit(duplicatedBlock, 'typename'),
          __typename: duplicatedBlock.typename,
          parentOrder: '2',
          id: 'newBlockId'
        },
        blockChild
      ])
    })

    it('should duplicate step block with new x and y', async () => {
      const newStepBlock = {
        ...stepBlock,
        action: null,
        x: 0,
        y: 0
      }
      service.getDuplicateBlockAndChildren = jest
        .fn()
        .mockReturnValue([newStepBlock])
      prismaService.block.update
        .mockResolvedValueOnce(duplicatedBlock)
        .mockResolvedValueOnce(blockChild)
        .mockResolvedValueOnce(block2)

      await service.duplicateBlock(newStepBlock, false, 1, undefined, 2, 3)
      expect(prismaService.block.update).toHaveBeenCalledWith({
        where: { id: newStepBlock.id },
        include: { action: true },
        data: {
          action: undefined,
          coverBlockId: newStepBlock.coverBlockId,
          nextBlockId: newStepBlock.nextBlockId,
          parentBlockId: undefined,
          posterBlockId: newStepBlock.posterBlockId,
          x: 2,
          y: 3
        }
      })
    })

    it('should add duplicated block at end by default', async () => {
      prismaService.block.update
        .mockResolvedValueOnce(duplicatedBlock)
        .mockResolvedValueOnce(blockChild)
        .mockResolvedValueOnce(block2)

      await service.duplicateBlock(block, false)

      expect(service.reorderSiblings).toHaveBeenCalledWith([
        block,
        block2,
        duplicatedBlock
      ])
    })

    it('should add duplicate block at position specified', async () => {
      prismaService.block.update
        .mockResolvedValueOnce(duplicatedBlock)
        .mockResolvedValueOnce(blockChild)
        .mockResolvedValueOnce(block2)

      await service.duplicateBlock(block, false, 1)

      expect(service.reorderSiblings).toHaveBeenCalledWith([
        block,
        duplicatedBlock,
        block2
      ])
    })

    it('should add duplicate block at end if parentOrder exceeds list length', async () => {
      prismaService.block.update
        .mockResolvedValueOnce(duplicatedBlock)
        .mockResolvedValueOnce(blockChild)
        .mockResolvedValueOnce(block2)

      await service.duplicateBlock(block, false, 5)

      expect(service.reorderSiblings).toHaveBeenCalledWith([
        block,
        block2,
        duplicatedBlock
      ])
    })

    it('should add duplicate block from end if parentOrder is negative', async () => {
      prismaService.block.update
        .mockResolvedValueOnce(duplicatedBlock)
        .mockResolvedValueOnce(blockChild)
        .mockResolvedValueOnce(block2)

      await service.duplicateBlock(block, false, -1)

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
          true,
          duplicateStepIds,
          undefined,
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
        true,
        'step1',
        undefined,
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

      jest.useFakeTimers()
      jest.setSystemTime(new Date('2024-10-22T03:39:39.268Z'))
    })

    it('should remove blocks and return siblings', async () => {
      prismaService.block.update.mockResolvedValueOnce(block)
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
      expect(prismaService.block.update).toHaveBeenCalledWith({
        data: { deletedAt: '2024-10-22T03:39:39.268Z' },
        where: { id: '1' }
      })
    })
  })

  it('should update journey updatedAt when block is deleted', async () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2024-10-22T03:39:39.268Z'))

    prismaService.block.update.mockResolvedValueOnce(block)
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
    expect(prismaService.journey.update).toHaveBeenCalledWith({
      data: {
        updatedAt: '2024-10-22T03:39:39.268Z'
      },
      where: {
        id: '1'
      }
    })
    expect(prismaService.block.update).toHaveBeenCalledWith({
      data: { deletedAt: '2024-10-22T03:39:39.268Z' },
      where: { id: '1' }
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

  describe('findParentStepBlock', () => {
    it('should return step block', async () => {
      await prismaService.block.findUnique
        .mockResolvedValueOnce(typographyBlock)
        .mockResolvedValueOnce(cardBlock)
        .mockResolvedValueOnce(stepBlock)
      expect(await service.findParentStepBlock(typographyBlock.id)).toEqual({
        id: 'step',
        journeyId: '1',
        nextBlockId: 'someId',
        parentBlockId: null,
        typename: 'StepBlock'
      })
    })

    it('should return undefined if parentBlockId is null', async () => {
      await prismaService.block.findUnique.mockResolvedValueOnce({
        ...typographyBlock,
        parentBlockId: null
      })
      expect(
        await service.findParentStepBlock(typographyBlock.id)
      ).toBeUndefined()
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
