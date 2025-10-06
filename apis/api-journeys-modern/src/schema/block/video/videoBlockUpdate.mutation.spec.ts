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

describe('videoBlockUpdate', () => {
  const mockUser = { id: 'userId' }
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  const VIDEO_BLOCK_UPDATE = graphql(`
    mutation VideoBlockUpdate($id: ID!, $input: VideoBlockUpdateInput!) {
      videoBlockUpdate(id: $id, input: $input) {
        id
        journeyId
        title
        description
        image
        duration
        objectFit
        startAt
        endAt
        muted
        autoplay
        fullsize
        videoId
        videoVariantLanguageId
        posterBlockId
        parentBlockId
      }
    }
  `)

  const {
    fetchBlockWithJourneyAcl
  } = require('../../../lib/auth/fetchBlockWithJourneyAcl')
  const mockAbility = ability as jest.MockedFunction<typeof ability>

  const id = 'blockId'
  const input = {
    parentBlockId: 'parentId',
    videoId: 'videoId2',
    videoVariantLanguageId: 'langId2',
    posterBlockId: 'poster2',
    title: 'New Title',
    description: 'New Desc',
    image: 'newImage',
    duration: 222,
    objectFit: 'fill' as const,
    startAt: 3,
    endAt: 221,
    muted: false,
    autoplay: true,
    fullsize: true
  }

  beforeEach(() => {
    jest.clearAllMocks()
    prismaMock.block.findMany.mockResolvedValue([] as any)
  })

  it('updates video block when authorized', async () => {
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
          journeyId: 'journeyId',
          typename: 'VideoBlock',
          ...input
        })
      },
      journey: { update: jest.fn().mockResolvedValue({ id: 'journeyId' }) }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    const result = await authClient({
      document: VIDEO_BLOCK_UPDATE,
      variables: { id, input }
    })

    // no direct fetch call; ACL helper used internally
    expect(mockAbility).toHaveBeenCalledWith(
      Action.Update,
      { subject: 'Journey', object: { id: 'journeyId' } },
      expect.any(Object)
    )
    expect(tx.block.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id } })
    )
    expect(tx.journey.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'journeyId' }
      })
    )

    expect(result).toEqual({
      data: {
        videoBlockUpdate: expect.objectContaining({
          id,
          journeyId: 'journeyId'
        })
      }
    })
  })

  it('returns FORBIDDEN if unauthorized', async () => {
    fetchBlockWithJourneyAcl.mockResolvedValue({
      id,
      journeyId: 'journeyId',
      journey: { id: 'journeyId' }
    })
    mockAbility.mockReturnValue(false)

    const result = await authClient({
      document: VIDEO_BLOCK_UPDATE,
      variables: { id, input }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'user is not allowed to update video block'
        })
      ]
    })
  })
})
