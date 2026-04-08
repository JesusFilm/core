import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'
import { Action, ability } from '../../../lib/auth/ability'
import { graphql } from '../../../lib/graphql/subgraphGraphql'

jest.mock('../../../lib/auth/ability', () => ({
  Action: { Update: 'update' },
  ability: jest.fn(),
  subject: jest.fn((type, object) => ({ subject: type, object }))
}))

jest.mock('../../../lib/auth/fetchJourneyWithAclIncludes', () => ({
  fetchJourneyWithAclIncludes: jest.fn()
}))

jest.mock('./transformInput', () => ({
  transformInput: jest.fn((input) => Promise.resolve(input))
}))

describe('imageBlockCreate', () => {
  const mockUser = { id: 'userId' }
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  const IMAGE_BLOCK_CREATE = graphql(`
    mutation ImageBlockCreate($input: ImageBlockCreateInput!) {
      imageBlockCreate(input: $input) {
        id
        journeyId
        parentBlockId
        parentOrder
        src
        alt
        width
        height
        blurhash
        scale
        focalTop
        focalLeft
        customizable
      }
    }
  `)

  const {
    fetchJourneyWithAclIncludes
  } = require('../../../lib/auth/fetchJourneyWithAclIncludes')
  const mockAbility = ability as jest.MockedFunction<typeof ability>

  const input = {
    journeyId: 'journeyId',
    parentBlockId: 'parentId',
    alt: 'Test image',
    src: 'https://example.com/image.jpg',
    width: 640,
    height: 480,
    blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4'
  }

  const mockBlock = {
    id: 'blockId',
    typename: 'ImageBlock',
    parentOrder: 0,
    journeyId: 'journeyId',
    parentBlockId: 'parentId',
    src: 'https://example.com/image.jpg',
    alt: 'Test image',
    width: 640,
    height: 480,
    blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4',
    scale: null,
    focalTop: null,
    focalLeft: null,
    customizable: null
  }

  beforeEach(() => {
    jest.clearAllMocks()
    fetchJourneyWithAclIncludes.mockResolvedValue({ id: 'journeyId' })
    mockAbility.mockReturnValue(true)
    prismaMock.block.findMany.mockResolvedValue([] as any)
  })

  it('creates image block when authorized', async () => {
    const tx = {
      block: {
        create: jest.fn().mockResolvedValue({
          ...mockBlock,
          journey: { id: 'journeyId' }
        }),
        findMany: jest.fn().mockResolvedValue([])
      },
      journey: { update: jest.fn().mockResolvedValue({ id: 'journeyId' }) }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    const result = await authClient({
      document: IMAGE_BLOCK_CREATE,
      variables: { input }
    })

    expect(tx.block.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          typename: 'ImageBlock',
          journey: { connect: { id: 'journeyId' } },
          parentBlock: { connect: { id: 'parentId' } },
          src: 'https://example.com/image.jpg',
          alt: 'Test image',
          parentOrder: 0
        })
      })
    )
    expect(tx.journey.update).toHaveBeenCalled()

    expect(result).toEqual({
      data: {
        imageBlockCreate: expect.objectContaining({
          id: 'blockId',
          journeyId: 'journeyId',
          parentBlockId: 'parentId',
          alt: 'Test image',
          src: 'https://example.com/image.jpg',
          width: 640,
          height: 480
        })
      }
    })
  })

  it('returns FORBIDDEN when unauthorized', async () => {
    mockAbility.mockReturnValue(false)

    const result = await authClient({
      document: IMAGE_BLOCK_CREATE,
      variables: { input }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'user is not allowed to create block'
        })
      ]
    })
  })

  it('creates cover image block and removes old cover', async () => {
    const oldCoverBlock = {
      id: 'oldCoverId',
      journeyId: 'journeyId',
      parentBlockId: 'parentId'
    }
    const tx = {
      block: {
        create: jest.fn().mockResolvedValue({
          ...mockBlock,
          parentOrder: null,
          journey: { id: 'journeyId' }
        }),
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn().mockResolvedValue({
          id: 'parentId',
          coverBlock: oldCoverBlock
        }),
        update: jest.fn().mockResolvedValue(oldCoverBlock)
      },
      journey: { update: jest.fn().mockResolvedValue({ id: 'journeyId' }) }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    const coverInput = {
      ...input,
      isCover: true
    }

    const result = await authClient({
      document: IMAGE_BLOCK_CREATE,
      variables: { input: coverInput }
    })

    expect(tx.block.findUnique).toHaveBeenCalledWith({
      where: { id: 'parentId' },
      include: { coverBlock: true }
    })
    expect(tx.block.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'oldCoverId' },
        data: { deletedAt: expect.any(String) }
      })
    )
    expect(tx.block.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          typename: 'ImageBlock',
          parentOrder: null,
          coverBlockParent: { connect: { id: 'parentId' } }
        })
      })
    )

    expect(result).toEqual({
      data: {
        imageBlockCreate: expect.objectContaining({
          id: 'blockId',
          parentOrder: null
        })
      }
    })
  })

  it('creates image block without parentBlockId', async () => {
    const tx = {
      block: {
        create: jest.fn().mockResolvedValue({
          ...mockBlock,
          parentBlockId: null,
          journey: { id: 'journeyId' }
        }),
        findMany: jest.fn().mockResolvedValue([])
      },
      journey: { update: jest.fn().mockResolvedValue({ id: 'journeyId' }) }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    const { parentBlockId, ...inputWithoutParent } = input

    const result = await authClient({
      document: IMAGE_BLOCK_CREATE,
      variables: { input: inputWithoutParent }
    })

    expect(tx.block.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          typename: 'ImageBlock',
          parentBlock: undefined
        })
      })
    )

    expect(result).toEqual({
      data: {
        imageBlockCreate: expect.objectContaining({
          id: 'blockId',
          parentBlockId: null
        })
      }
    })
  })

  it('creates image block with all optional fields', async () => {
    const fullBlock = {
      ...mockBlock,
      id: 'customId',
      scale: 50,
      focalTop: 30,
      focalLeft: 40,
      customizable: true,
      parentOrder: 2
    }
    const tx = {
      block: {
        create: jest.fn().mockResolvedValue({
          ...fullBlock,
          journey: { id: 'journeyId' }
        }),
        findMany: jest.fn().mockResolvedValue([{}, {}])
      },
      journey: { update: jest.fn().mockResolvedValue({ id: 'journeyId' }) }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    const fullInput = {
      ...input,
      id: 'customId',
      scale: 50,
      focalTop: 30,
      focalLeft: 40,
      customizable: true
    }

    const result = await authClient({
      document: IMAGE_BLOCK_CREATE,
      variables: { input: fullInput }
    })

    expect(tx.block.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          id: 'customId',
          typename: 'ImageBlock',
          scale: 50,
          focalTop: 30,
          focalLeft: 40,
          customizable: true,
          parentOrder: 2
        })
      })
    )

    expect(result).toEqual({
      data: {
        imageBlockCreate: expect.objectContaining({
          id: 'customId',
          scale: 50,
          focalTop: 30,
          focalLeft: 40,
          customizable: true
        })
      }
    })
  })
})
