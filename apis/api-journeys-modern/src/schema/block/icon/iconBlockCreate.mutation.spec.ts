import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'
import { ability } from '../../../lib/auth/ability'
import { graphql } from '../../../lib/graphql/subgraphGraphql'

jest.mock('../../../lib/auth/ability', () => ({
  Action: { Update: 'update' },
  ability: jest.fn(),
  subject: jest.fn((type, object) => ({ subject: type, object }))
}))

jest.mock('../../../lib/auth/fetchJourneyWithAclIncludes', () => ({
  fetchJourneyWithAclIncludes: jest.fn()
}))

describe('iconBlockCreate', () => {
  const mockUser = { id: 'userId' }
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  const ICON_BLOCK_CREATE = graphql(`
    mutation IconBlockCreate($input: IconBlockCreateInput!) {
      iconBlockCreate(input: $input) {
        id
        journeyId
        parentBlockId
        parentOrder
        ... on IconBlock {
          name
          color
          size
        }
      }
    }
  `)

  const {
    fetchJourneyWithAclIncludes
  } = require('../../../lib/auth/fetchJourneyWithAclIncludes')
  const mockAbility = ability as jest.MockedFunction<typeof ability>

  const input = {
    journeyId: 'journeyId',
    parentBlockId: 'parentId'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    fetchJourneyWithAclIncludes.mockResolvedValue({ id: 'journeyId' })
    mockAbility.mockReturnValue(true)
    prismaMock.block.findFirst.mockResolvedValue({
      id: 'parentId',
      journeyId: 'journeyId'
    } as any)
    prismaMock.block.findUnique.mockResolvedValue({
      id: 'blockId',
      typename: 'IconBlock',
      parentOrder: null,
      journeyId: 'journeyId',
      parentBlockId: 'parentId',
      name: null,
      color: null,
      size: null
    } as any)
  })

  it('creates icon block when authorized', async () => {
    const tx = {
      block: {
        create: jest.fn().mockResolvedValue({
          id: 'blockId',
          typename: 'IconBlock',
          parentOrder: null,
          journeyId: 'journeyId',
          parentBlockId: 'parentId',
          name: null,
          color: null,
          size: null,
          journey: { id: 'journeyId' }
        })
      },
      journey: { update: jest.fn().mockResolvedValue({ id: 'journeyId' }) }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    const result = await authClient({
      document: ICON_BLOCK_CREATE,
      variables: { input }
    })

    expect(tx.block.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          typename: 'IconBlock',
          journey: { connect: { id: 'journeyId' } },
          parentBlock: { connect: { id: 'parentId' } },
          parentOrder: null
        })
      })
    )
    expect(tx.journey.update).toHaveBeenCalled()

    expect(result).toEqual({
      data: {
        iconBlockCreate: expect.objectContaining({
          id: 'blockId',
          journeyId: 'journeyId',
          parentBlockId: 'parentId',
          parentOrder: null,
          name: null,
          color: null,
          size: null
        })
      }
    })
  })

  it('creates icon block with all optional fields', async () => {
    const tx = {
      block: {
        create: jest.fn().mockResolvedValue({
          id: 'customId',
          typename: 'IconBlock',
          parentOrder: null,
          journeyId: 'journeyId',
          parentBlockId: 'parentId',
          name: 'CheckCircleRounded',
          color: 'primary',
          size: 'lg',
          journey: { id: 'journeyId' }
        })
      },
      journey: { update: jest.fn().mockResolvedValue({ id: 'journeyId' }) }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    const fullInput = {
      id: 'customId',
      journeyId: 'journeyId',
      parentBlockId: 'parentId',
      name: 'CheckCircleRounded' as const,
      color: 'primary' as const,
      size: 'lg' as const
    }

    const result = await authClient({
      document: ICON_BLOCK_CREATE,
      variables: { input: fullInput }
    })

    expect(tx.block.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          id: 'customId',
          typename: 'IconBlock',
          name: 'CheckCircleRounded',
          color: 'primary',
          size: 'lg',
          parentOrder: null
        })
      })
    )

    expect(result).toEqual({
      data: {
        iconBlockCreate: expect.objectContaining({
          id: 'customId',
          journeyId: 'journeyId',
          parentBlockId: 'parentId',
          parentOrder: null,
          name: 'CheckCircleRounded',
          color: 'primary',
          size: 'lg'
        })
      }
    })
  })

  it('sets parentOrder to null', async () => {
    const tx = {
      block: {
        create: jest.fn().mockResolvedValue({
          id: 'blockId',
          typename: 'IconBlock',
          parentOrder: null,
          journeyId: 'journeyId',
          parentBlockId: 'parentId',
          name: null,
          color: null,
          size: null,
          journey: { id: 'journeyId' }
        })
      },
      journey: { update: jest.fn().mockResolvedValue({ id: 'journeyId' }) }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    await authClient({
      document: ICON_BLOCK_CREATE,
      variables: { input }
    })

    expect(tx.block.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          parentOrder: null
        })
      })
    )
  })

  it('throws error when user is not authorized', async () => {
    mockAbility.mockReturnValue(false)

    const result = await authClient({
      document: ICON_BLOCK_CREATE,
      variables: { input }
    })

    expect(result).toEqual({
      data: null,
      errors: expect.arrayContaining([
        expect.objectContaining({
          message: 'user is not allowed to create block'
        })
      ])
    })
  })

  it('throws error when parent block not found', async () => {
    prismaMock.block.findFirst.mockResolvedValue(null)

    const result = await authClient({
      document: ICON_BLOCK_CREATE,
      variables: { input }
    })

    expect(result).toEqual({
      data: null,
      errors: expect.arrayContaining([
        expect.objectContaining({
          message: 'parent block not found in journey'
        })
      ])
    })
  })
})
