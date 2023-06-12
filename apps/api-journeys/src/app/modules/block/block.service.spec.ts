import { Test, TestingModule } from '@nestjs/testing'
import { v4 as uuidv4 } from 'uuid'
import {
  mockCollectionRemoveResult,
  mockCollectionSaveResult,
  mockCollectionSaveAllResult,
  mockCollectionUpdateAllResult,
  mockDbQueryResult
} from '@core/nest/database/mock'
import { keyAsId } from '@core/nest/decorators/KeyAsId'
import { Journey } from '.prisma/api-journeys-client'

import { PrismaService } from '../../lib/prisma.service'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName,
  Block
} from '../../__generated__/graphql'
import { BlockService } from './block.service'

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>

describe('BlockService', () => {
  let service: BlockService, prisma: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BlockService, PrismaService]
    }).compile()

    service = module.get<BlockService>(BlockService)
    prisma = module.get<PrismaService>(PrismaService)
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
    teamId: 'teamId'
  } as unknown as Journey

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

  const stepBlock = {
    __typename: 'StepBlock',
    id: 'step',
    journeyId: journey.id,
    parentBlockId: null,
    nextBlockId: 'someId'
  }
  const cardBlock = {
    __typename: 'CardBlock',
    id: 'card',
    journeyId: journey.id,
    parentBlockId: stepBlock.id,
    coverBlockId: 'video'
  }
  const videoBlock = {
    __typename: 'VideoBlock',
    id: cardBlock.coverBlockId,
    journeyId: journey.id,
    parentBlockId: cardBlock.id,
    posterBlockId: 'image',
    videoId: 'videoId',
    videoVariantLanguageId: 'videoVariantLanguageId'
  }
  const imageBlock = {
    __typename: 'ImageBlock',
    id: videoBlock.posterBlockId,
    journeyId: journey.id,
    parentBlockId: videoBlock.id
  }
  const typographyBlock = {
    __typename: 'TypographyBlock',
    id: 'typography',
    journeyId: journey.id,
    parentBlockId: cardBlock.id
  }
  const buttonBlock = {
    __typename: 'ButtonBlock',
    id: 'button',
    journeyId: journey.id,
    parentBlockId: cardBlock.id,
    startIconId: null,
    endIconId: 'icon',
    action: { parentBlockId: 'ButtonBlock', blockId: 'step' }
  }
  const iconBlock = {
    __typename: 'IconBlock',
    id: buttonBlock.endIconId,
    journeyId: journey.id,
    parentBlockId: buttonBlock.id
  }

  describe('getSiblings', () => {
    it('should return all siblings of a block', async () => {
      prisma.block.findMany = jest.fn().mockReturnValue([block, block])
      expect(
        await service.getSiblings(block.journeyId, block.parentBlockId)
      ).toEqual([block, block])
    })
  })

  describe('save', () => {
    it('should return a saved block', async () => {
      prisma.block.create = jest.fn().mockReturnValue(block)
      expect(await service.save(block)).toEqual(block)
    })
  })

  describe('update', () => {
    it('should return an updated block', async () => {
      prisma.block.update = jest
        .fn()
        .mockImplementationOnce((data) => data.data)
      expect(await service.update(block.id, block)).toEqual(block)
    })
  })

  describe('reorderSiblings', () => {
    it('should update parent order', async () => {
      prisma.block.update = jest
        .fn()
        .mockImplementationOnce((result) => result.data)
      // service.updateAll = jest.fn().mockReturnValue([
      //   { ...block, parentOrder: 0 },
      //   { ...block, parentOrder: 1 }
      // ])
      expect(
        await service.reorderSiblings([
          { ...block, id: block.id, parentOrder: 2 },
          { ...block, id: block.id, parentOrder: 3 }
        ])
      ).toEqual([
        { ...block, parentOrder: 0 },
        { ...block, parentOrder: 1 }
      ])
      expect(prisma.block.update).toHaveBeenCalledWith({
        ...block,
        id: block.id,
        parentOrder: 0
      })
      expect(prisma.block.update).toHaveBeenCalledWith({
        ...block,
        id: block.id,
        parentOrder: 1
      })
    })
  })

  describe('reorderBlock', () => {
    beforeEach(() => {
      db.query.mockReturnValue(mockDbQueryResult(service.db, [block, block]))
      service.reorderSiblings = jest.fn(
        async () =>
          await Promise.resolve([
            { _key: '2', parentOrder: 0 } as unknown as Block,
            { _key: block._key, parentOrder: 1 } as unknown as Block
          ])
      )
    })

    it('should update block order', async () => {
      service.getSiblingsInternal = jest
        .fn()
        .mockReturnValue([block, { ...block, _key: '2', parentOrder: 1 }])

      expect(await service.reorderBlock(block._key, journey.id, 1)).toEqual([
        { id: '2', parentOrder: 0 },
        { id: block._key, parentOrder: 1 }
      ])
      expect(service.reorderSiblings).toHaveBeenCalledWith([
        { ...block, _key: '2', parentOrder: 1 },
        block
      ])
    })
    it('does not update if block not part of current journey', async () => {
      expect(
        await service.reorderBlock(block.__typename, 'invalidJourney', 2)
      ).toEqual([])
      expect(service.reorderSiblings).toBeCalledTimes(0)
    })

    it('does not update if block does not have parent order', async () => {
      service.get = jest.fn().mockReturnValue({ ...block, parentOrder: null })

      expect(await service.reorderBlock(block._key, journey.id, 2)).toEqual([])
      expect(service.reorderSiblings).toBeCalledTimes(0)
    })
  })

  describe('duplicateBlock', () => {
    const block2 = { ...block, _key: '2', parentOrder: 1 }
    const duplicatedBlock = { ...block, _key: 'duplicated' }
    const blockChild = {
      _key: 'child',
      _typename: 'TypographyBlock',
      parentBlockId: duplicatedBlock._key
    }
    const blockChildWithId = keyAsId(blockChild) as Block

    beforeEach(() => {
      db.query.mockReturnValue(mockDbQueryResult(service.db, [block, block2]))
      collectionMock.saveAll.mockReturnValue(
        mockCollectionSaveAllResult(service.collection, [
          duplicatedBlock,
          blockChild
        ])
      )
      collectionMock.updateAll.mockReturnValue(
        mockCollectionUpdateAllResult(service.collection, [])
      )
      service.getSiblingsInternal = jest.fn().mockReturnValue([
        { ...block, id: block._key },
        { ...duplicatedBlock, id: duplicatedBlock._key },
        { ...block2, id: block2._key }
      ])
      service.getDuplicateBlockAndChildren = jest.fn().mockReturnValue([
        { ...duplicatedBlock, id: duplicatedBlock._key },
        { ...blockChild, id: blockChild._key }
      ])
      service.reorderSiblings = jest.fn().mockReturnValue([])
    })

    it('should return the duplicated block, its siblings and children', async () => {
      const blockAndSiblings = [
        blockWithId,
        { ...blockWithId, id: block2._key },
        { ...duplicatedBlock, id: duplicatedBlock._key, parentOrder: '2' }
      ]

      service.reorderSiblings = jest.fn().mockReturnValue(blockAndSiblings)

      expect(await service.duplicateBlock(block._key, journey.id)).toEqual([
        ...blockAndSiblings,
        blockChildWithId
      ])
    })

    it('should add duplicated block at end by default', async () => {
      await service.duplicateBlock(block._key, journey.id)

      expect(service.reorderSiblings).toHaveBeenCalledWith([
        { ...block, id: block._key },
        { ...block2, id: block2._key },
        { ...duplicatedBlock, id: duplicatedBlock._key }
      ])
    })

    it('should add duplicate block at position specified', async () => {
      await service.duplicateBlock(block._key, journey.id, 1)

      expect(service.reorderSiblings).toHaveBeenCalledWith([
        { ...block, id: block._key },
        { ...duplicatedBlock, id: duplicatedBlock._key },
        { ...block2, id: block2._key }
      ])
    })

    it('should add duplicate block at end if parentOrder exceeds list length', async () => {
      await service.duplicateBlock(block._key, journey.id, 5)

      expect(service.reorderSiblings).toHaveBeenCalledWith([
        { ...block, id: block._key },
        { ...block2, id: block2._key },
        { ...duplicatedBlock, id: duplicatedBlock._key }
      ])
    })

    it('should add duplicate block from end if parentOrder is negative', async () => {
      await service.duplicateBlock(block._key, journey.id, -1)

      expect(service.reorderSiblings).toHaveBeenCalledWith([
        { ...block, id: block._key },
        { ...duplicatedBlock, id: duplicatedBlock._key },
        { ...block2, id: block2._key }
      ])
    })

    it('does not duplicate if block not part of current journey', async () => {
      expect(
        await service.reorderBlock(block.__typename, 'invalidJourney', 2)
      ).toEqual([])
      expect(service.reorderSiblings).toBeCalledTimes(0)
    })
  })

  describe('getDuplicateBlockAndChildren', () => {
    beforeEach(() => {
      service.getBlocksForParentId = jest.fn().mockReturnValue([])
    })

    it('should return block with randomised id', async () => {
      db.query.mockReturnValue(mockDbQueryResult(service.db, [{ id: 'block' }]))
      mockUuidv4.mockReturnValueOnce(`${typographyBlock.id}Copy`)

      expect(
        await service.getDuplicateBlockAndChildren(
          typographyBlock.id,
          '1',
          cardBlock.id
        )
      ).toEqual([
        {
          _key: `${typographyBlock.id}Copy`,
          id: `${typographyBlock.id}Copy`,
          parentBlockId: cardBlock.id
        }
      ])
      expect(service.getBlocksForParentId).toBeCalledTimes(1)
    })

    it('should return block with specific id', async () => {
      db.query
        .mockReturnValueOnce(mockDbQueryResult(service.db, [stepBlock]))
        .mockReturnValueOnce(mockDbQueryResult(service.db, [cardBlock]))
        .mockReturnValueOnce(mockDbQueryResult(service.db, [videoBlock]))
        .mockReturnValueOnce(mockDbQueryResult(service.db, [buttonBlock]))
        .mockReturnValueOnce(mockDbQueryResult(service.db, [imageBlock]))
        .mockReturnValueOnce(mockDbQueryResult(service.db, [iconBlock]))
      mockUuidv4
        .mockReturnValueOnce(`${cardBlock.id}Copy`)
        .mockReturnValueOnce(`${videoBlock.id}Copy`)
        .mockReturnValueOnce(`${buttonBlock.id}Copy`)
        .mockReturnValueOnce(`${imageBlock.id}Copy`)
        .mockReturnValue(`${iconBlock.id}Copy`)
      service.getBlocksForParentId = jest
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
          '1',
          null,
          'specificStepId'
        )
      ).toEqual([
        {
          ...stepBlock,
          _key: 'specificStepId',
          id: 'specificStepId',
          parentBlockId: null,
          nextBlockId: null
        },
        {
          ...cardBlock,
          _key: `${cardBlock.id}Copy`,
          id: `${cardBlock.id}Copy`,
          parentBlockId: 'specificStepId',
          coverBlockId: `${videoBlock.id}Copy`
        },
        {
          ...videoBlock,
          _key: `${videoBlock.id}Copy`,
          id: `${videoBlock.id}Copy`,
          parentBlockId: `${cardBlock.id}Copy`,
          posterBlockId: `${imageBlock.id}Copy`
        },
        {
          ...imageBlock,
          _key: `${imageBlock.id}Copy`,
          id: `${imageBlock.id}Copy`,
          parentBlockId: `${videoBlock.id}Copy`
        },
        {
          ...buttonBlock,
          _key: `${buttonBlock.id}Copy`,
          id: `${buttonBlock.id}Copy`,
          parentBlockId: `${cardBlock.id}Copy`,
          endIconId: `${iconBlock.id}Copy`
        },
        {
          ...iconBlock,
          _key: `${iconBlock.id}Copy`,
          id: `${iconBlock.id}Copy`,
          parentBlockId: `${buttonBlock.id}Copy`
        }
      ])

      expect(service.getBlocksForParentId).toBeCalledTimes(6)
    })

    it('should return block with updated journeyId & nextBlockId', async () => {
      db.query.mockReturnValueOnce(mockDbQueryResult(service.db, [stepBlock]))
      const duplicateStepIds = new Map()
      duplicateStepIds.set(stepBlock.nextBlockId, 'duplicateStepId')
      mockUuidv4.mockReturnValueOnce(`${stepBlock.id}Copy`)

      expect(
        await service.getDuplicateBlockAndChildren(
          buttonBlock.id,
          '1',
          cardBlock.id,
          undefined,
          'journey2',
          duplicateStepIds
        )
      ).toEqual([
        {
          ...stepBlock,
          _key: `${stepBlock.id}Copy`,
          id: `${stepBlock.id}Copy`,
          journeyId: 'journey2',
          parentBlockId: cardBlock.id,
          nextBlockId: 'duplicateStepId'
        }
      ])

      expect(service.getBlocksForParentId).toBeCalledTimes(1)
    })
  })

  describe('getDuplicateChildren', () => {
    it('should return an array of duplicate blocks from array', async () => {
      db.query
        .mockReturnValueOnce(mockDbQueryResult(service.db, [stepBlock]))
        .mockReturnValueOnce(mockDbQueryResult(service.db, [cardBlock]))

      service.getDuplicateBlockAndChildren = jest
        .fn()
        .mockReturnValueOnce([{ block: 'duplicateStepBlock' }])
        .mockReturnValue([])

      const duplicateStepIds = new Map([[stepBlock.id, 'step1']])

      expect(
        await service.getDuplicateChildren(
          [stepBlock],
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
      db.query.mockReturnValue(mockDbQueryResult(service.db, [block, block]))
      collectionMock.remove.mockReturnValue(
        mockCollectionRemoveResult(service.collection, block)
      )
      service.reorderSiblings = jest.fn(
        async () =>
          await Promise.resolve([
            { _key: block._key, parentOrder: 0 } as unknown as Block,
            { _key: block._key, parentOrder: 1 } as unknown as Block
          ])
      )
    })

    it('should remove blocks and return siblings', async () => {
      service.getSiblingsInternal = jest.fn().mockReturnValue([
        { _key: block._key, parentOrder: 1 },
        { _key: block._key, parentOrder: 2 }
      ])
      service.reorderSiblings = jest.fn().mockReturnValue([
        { _key: block._key, parentOrder: 0 },
        { _key: block._key, parentOrder: 1 }
      ])

      expect(
        await service.removeBlockAndChildren(
          block._key,
          journey.id,
          block.parentBlockId
        )
      ).toEqual([
        { id: block._key, parentOrder: 0 },
        { id: block._key, parentOrder: 1 }
      ])
      expect(service.getSiblingsInternal).toHaveBeenCalledWith(
        journey.id,
        block.parentBlockId
      )
    })

    it('should update parent order', async () => {
      collectionMock.updateAll.mockReturnValue(
        mockCollectionUpdateAllResult(service.collection, [
          { _key: block._key, new: block },
          { _key: block._key, new: block }
        ])
      )
      const siblings = [
        { ...block, id: block._key },
        { ...block, id: block._key }
      ]

      service.getSiblingsInternal = jest.fn(
        async () => await Promise.resolve(siblings)
      )
      expect(await service.reorderSiblings(siblings)).toEqual([
        { _key: block._key, parentOrder: 0 },
        { _key: block._key, parentOrder: 1 }
      ])
    })

    describe('validateBlock', () => {
      beforeEach(() => {
        db.query.mockReturnValue(mockDbQueryResult(service.db, [block]))
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
        expect(
          await service.validateBlock('1', journey.id, 'journeyId')
        ).toEqual(true)
      })

      it('should return false with incorrect journey id', async () => {
        expect(
          await service.validateBlock('1', 'wrongJourney', 'journeyId')
        ).toEqual(false)
      })
    })
  })
})
