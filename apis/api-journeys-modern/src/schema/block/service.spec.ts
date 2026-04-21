import { prismaMock } from '../../../test/prismaMock'
import { ability } from '../../lib/auth/ability'

import {
  authorizeBlockCreate,
  reorderBlock,
  validateParentBlock
} from './service'

jest.mock('../../lib/auth/ability', () => ({
  Action: { Update: 'update' },
  ability: jest.fn(),
  subject: jest.fn((type, object) => ({ subject: type, object }))
}))

jest.mock('../../lib/auth/fetchJourneyWithAclIncludes', () => ({
  fetchJourneyWithAclIncludes: jest.fn()
}))

const {
  fetchJourneyWithAclIncludes
} = require('../../lib/auth/fetchJourneyWithAclIncludes')

const mockAbility = ability as jest.MockedFunction<typeof ability>

describe('authorizeBlockCreate', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('resolves when user is authorized', async () => {
    fetchJourneyWithAclIncludes.mockResolvedValue({ id: 'journeyId' })
    mockAbility.mockReturnValue(true)

    await expect(
      authorizeBlockCreate('journeyId', { id: 'userId' } as any)
    ).resolves.toBeUndefined()

    expect(fetchJourneyWithAclIncludes).toHaveBeenCalledWith('journeyId')
    expect(mockAbility).toHaveBeenCalledWith(
      'update',
      { subject: 'Journey', object: { id: 'journeyId' } },
      { id: 'userId' }
    )
  })

  it('throws FORBIDDEN when user is not authorized', async () => {
    fetchJourneyWithAclIncludes.mockResolvedValue({ id: 'journeyId' })
    mockAbility.mockReturnValue(false)

    await expect(
      authorizeBlockCreate('journeyId', { id: 'userId' } as any)
    ).rejects.toThrow('user is not allowed to create block')
  })
})

describe('validateParentBlock', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('resolves when parent block exists in journey', async () => {
    prismaMock.block.findFirst.mockResolvedValue({
      id: 'parentId',
      journeyId: 'journeyId'
    } as any)

    await expect(
      validateParentBlock('parentId', 'journeyId')
    ).resolves.toBeUndefined()

    expect(prismaMock.block.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'parentId',
        journeyId: 'journeyId',
        deletedAt: null
      }
    })
  })

  it('throws BAD_USER_INPUT when parent block not found', async () => {
    prismaMock.block.findFirst.mockResolvedValue(null)

    await expect(
      validateParentBlock('wrongParentId', 'journeyId')
    ).rejects.toThrow('parent block not found in journey')
  })

  it('throws BAD_USER_INPUT when parent block belongs to different journey', async () => {
    prismaMock.block.findFirst.mockResolvedValue(null)

    await expect(
      validateParentBlock('parentId', 'differentJourneyId')
    ).rejects.toThrow('parent block not found in journey')

    expect(prismaMock.block.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'parentId',
        journeyId: 'differentJourneyId',
        deletedAt: null
      }
    })
  })
})

describe('reorderBlock', () => {
  const block = {
    id: 'blockId',
    journeyId: 'journeyId',
    parentBlockId: 'parentId',
    parentOrder: 0,
    typename: 'ImageBlock',
    action: null
  } as any

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns empty array when block has no parentOrder', async () => {
    const result = await reorderBlock(
      { ...block, parentOrder: null },
      1,
      prismaMock as any
    )

    expect(result).toEqual([])
    expect(prismaMock.block.findMany).not.toHaveBeenCalled()
    expect(prismaMock.block.update).not.toHaveBeenCalled()
  })

  it('reorders sibling blocks with the block at the given position', async () => {
    const sibling1 = { ...block, id: 'sibling1', parentOrder: 0 }
    const sibling2 = { ...block, id: 'sibling2', parentOrder: 1 }
    prismaMock.block.findMany.mockResolvedValue([sibling1, sibling2])
    prismaMock.block.update
      .mockResolvedValueOnce({ ...sibling1, parentOrder: 0 })
      .mockResolvedValueOnce({ ...block, parentOrder: 1 })
      .mockResolvedValueOnce({ ...sibling2, parentOrder: 2 })

    const result = await reorderBlock(block, 1, prismaMock as any)

    expect(prismaMock.block.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          journeyId: 'journeyId',
          parentBlockId: 'parentId',
          parentOrder: { not: null },
          deletedAt: null,
          id: { not: 'blockId' }
        }),
        orderBy: { parentOrder: 'asc' },
        include: { action: true }
      })
    )
    expect(prismaMock.block.update).toHaveBeenNthCalledWith(1, {
      where: { id: 'sibling1' },
      data: { parentOrder: 0 },
      include: { action: true }
    })
    expect(prismaMock.block.update).toHaveBeenNthCalledWith(2, {
      where: { id: 'blockId' },
      data: { parentOrder: 1 },
      include: { action: true }
    })
    expect(prismaMock.block.update).toHaveBeenNthCalledWith(3, {
      where: { id: 'sibling2' },
      data: { parentOrder: 2 },
      include: { action: true }
    })
    expect(result).toHaveLength(3)
  })

  it('queries StepBlocks (no parentBlockId) when block has none', async () => {
    const stepBlock = {
      ...block,
      typename: 'StepBlock',
      parentBlockId: null,
      parentOrder: 0
    }
    prismaMock.block.findMany.mockResolvedValue([])
    prismaMock.block.update.mockResolvedValueOnce({
      ...stepBlock,
      parentOrder: 0
    })

    await reorderBlock(stepBlock, 0, prismaMock as any)

    expect(prismaMock.block.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          journeyId: 'journeyId',
          typename: 'StepBlock',
          parentOrder: { not: null },
          deletedAt: null,
          id: { not: 'blockId' }
        })
      })
    )
  })
})
