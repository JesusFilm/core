import { prismaMock } from '../../../test/prismaMock'
import { ability } from '../../lib/auth/ability'

import { authorizeBlockCreate, validateParentBlock } from './service'

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
