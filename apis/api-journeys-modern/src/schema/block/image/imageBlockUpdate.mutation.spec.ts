import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'
import { Action, ability } from '../../../lib/auth/ability'
import { graphql } from '../../../lib/graphql/subgraphGraphql'

jest.mock('../../../lib/auth/ability', () => ({
  Action: { Update: 'update' },
  ability: jest.fn(),
  subject: jest.fn((type, object) => ({ subject: type, object }))
}))

jest.mock('../../../lib/auth/fetchBlockWithJourneyAcl', () => ({
  fetchBlockWithJourneyAcl: jest.fn()
}))

jest.mock('./transformInput', () => ({
  transformInput: jest.fn((input) => Promise.resolve(input))
}))

describe('imageBlockUpdate', () => {
  const mockUser = { id: 'userId' }
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  const IMAGE_BLOCK_UPDATE = graphql(`
    mutation ImageBlockUpdate($id: ID!, $input: ImageBlockUpdateInput!) {
      imageBlockUpdate(id: $id, input: $input) {
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
    fetchBlockWithJourneyAcl
  } = require('../../../lib/auth/fetchBlockWithJourneyAcl')
  const mockAbility = ability as jest.MockedFunction<typeof ability>
  const { transformInput } = require('./transformInput')

  const id = 'blockId'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('updates image block when authorized', async () => {
    fetchBlockWithJourneyAcl.mockResolvedValue({
      id,
      journeyId: 'journeyId',
      journey: { id: 'journeyId' }
    })
    mockAbility.mockReturnValue(true)

    const tx = {
      block: {
        update: jest.fn().mockResolvedValue({
          id,
          typename: 'ImageBlock',
          journeyId: 'journeyId',
          parentBlockId: 'parentId',
          parentOrder: 0,
          src: 'https://example.com/updated.jpg',
          alt: 'Updated image',
          width: 800,
          height: 600,
          blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4',
          scale: null,
          focalTop: null,
          focalLeft: null,
          customizable: null
        })
      },
      action: { upsert: jest.fn(), delete: jest.fn() },
      journey: { update: jest.fn().mockResolvedValue({ id: 'journeyId' }) }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    const result = await authClient({
      document: IMAGE_BLOCK_UPDATE,
      variables: {
        id,
        input: {
          src: 'https://example.com/updated.jpg',
          alt: 'Updated image',
          width: 800,
          height: 600,
          blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4'
        }
      }
    })

    expect(fetchBlockWithJourneyAcl).toHaveBeenCalledWith(id)
    expect(mockAbility).toHaveBeenCalledWith(
      Action.Update,
      { subject: 'Journey', object: { id: 'journeyId' } },
      expect.any(Object)
    )
    expect(transformInput).toHaveBeenCalledWith(
      expect.objectContaining({
        src: 'https://example.com/updated.jpg',
        alt: 'Updated image'
      })
    )
    expect(tx.block.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id },
        data: expect.objectContaining({
          src: 'https://example.com/updated.jpg',
          alt: 'Updated image'
        })
      })
    )
    expect(tx.journey.update).toHaveBeenCalled()

    expect(result).toEqual({
      data: {
        imageBlockUpdate: expect.objectContaining({
          id,
          journeyId: 'journeyId',
          src: 'https://example.com/updated.jpg',
          alt: 'Updated image',
          width: 800,
          height: 600
        })
      }
    })
  })

  it('returns FORBIDDEN when unauthorized', async () => {
    fetchBlockWithJourneyAcl.mockResolvedValue({
      id,
      journeyId: 'journeyId',
      journey: { id: 'journeyId' }
    })
    mockAbility.mockReturnValue(false)

    const result = await authClient({
      document: IMAGE_BLOCK_UPDATE,
      variables: {
        id,
        input: { alt: 'Updated image' }
      }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'user is not allowed to update block'
        })
      ]
    })
  })

  it('updates with all optional fields', async () => {
    fetchBlockWithJourneyAcl.mockResolvedValue({
      id,
      journeyId: 'journeyId',
      journey: { id: 'journeyId' }
    })
    mockAbility.mockReturnValue(true)

    const tx = {
      block: {
        update: jest.fn().mockResolvedValue({
          id,
          typename: 'ImageBlock',
          journeyId: 'journeyId',
          parentBlockId: 'parentId',
          parentOrder: 0,
          src: 'https://example.com/full.jpg',
          alt: 'Full update',
          width: 1920,
          height: 1080,
          blurhash: 'LEHV6nWB2yk8pyoJadR*.7kCMdnj',
          scale: 75,
          focalTop: 50,
          focalLeft: 40,
          customizable: true
        })
      },
      action: { upsert: jest.fn(), delete: jest.fn() },
      journey: { update: jest.fn().mockResolvedValue({ id: 'journeyId' }) }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    const result = await authClient({
      document: IMAGE_BLOCK_UPDATE,
      variables: {
        id,
        input: {
          src: 'https://example.com/full.jpg',
          alt: 'Full update',
          width: 1920,
          height: 1080,
          blurhash: 'LEHV6nWB2yk8pyoJadR*.7kCMdnj',
          scale: 75,
          focalTop: 50,
          focalLeft: 40,
          customizable: true
        }
      }
    })

    expect(tx.block.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id },
        data: expect.objectContaining({
          src: 'https://example.com/full.jpg',
          alt: 'Full update',
          scale: 75,
          focalTop: 50,
          focalLeft: 40,
          customizable: true
        })
      })
    )

    expect(result).toEqual({
      data: {
        imageBlockUpdate: expect.objectContaining({
          id,
          scale: 75,
          focalTop: 50,
          focalLeft: 40,
          customizable: true
        })
      }
    })
  })

  it('updates with partial input fields', async () => {
    fetchBlockWithJourneyAcl.mockResolvedValue({
      id,
      journeyId: 'journeyId',
      journey: { id: 'journeyId' }
    })
    mockAbility.mockReturnValue(true)

    const tx = {
      block: {
        update: jest.fn().mockResolvedValue({
          id,
          typename: 'ImageBlock',
          journeyId: 'journeyId',
          parentBlockId: 'parentId',
          parentOrder: 0,
          src: null,
          alt: 'Only alt changed',
          width: 0,
          height: 0,
          blurhash: '',
          scale: null,
          focalTop: null,
          focalLeft: null,
          customizable: null
        })
      },
      action: { upsert: jest.fn(), delete: jest.fn() },
      journey: { update: jest.fn().mockResolvedValue({ id: 'journeyId' }) }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    const result = await authClient({
      document: IMAGE_BLOCK_UPDATE,
      variables: {
        id,
        input: { alt: 'Only alt changed' }
      }
    })

    expect(tx.block.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id },
        data: expect.objectContaining({
          alt: 'Only alt changed'
        })
      })
    )

    expect(result).toEqual({
      data: {
        imageBlockUpdate: expect.objectContaining({
          id,
          alt: 'Only alt changed'
        })
      }
    })
  })
})
