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

describe('videoBlockCreate', () => {
  const mockUser = { id: 'userId' }
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  const VIDEO_BLOCK_CREATE = graphql(`
    mutation VideoBlockCreate($input: VideoBlockCreateInput!) {
      videoBlockCreate(input: $input) {
        id
        journeyId
        parentBlockId
        videoId
        videoVariantLanguageId
        source
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
        posterBlockId
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
    videoId: 'videoId',
    videoVariantLanguageId: 'langId',
    source: 'internal' as const,
    title: 'Title',
    description: 'Desc',
    image: 'img',
    duration: 120,
    objectFit: 'fill' as const,
    startAt: 0,
    endAt: 120,
    muted: true,
    autoplay: true,
    fullsize: false,
    posterBlockId: 'posterId'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    prismaMock.block.findMany.mockResolvedValue([] as any)
  })

  it('creates video block when authorized', async () => {
    fetchJourneyWithAclIncludes.mockResolvedValue({ id: 'journeyId' })
    mockAbility.mockReturnValue(true)

    const tx = {
      block: {
        create: jest.fn().mockResolvedValue({
          id: 'blockId',
          ...input,
          typename: 'VideoBlock',
          parentOrder: 0
        }),
        findFirst: jest.fn().mockResolvedValue(null)
      },
      journey: { update: jest.fn().mockResolvedValue({ id: 'journeyId' }) }
    }
    prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(tx))

    const result = await authClient({
      document: VIDEO_BLOCK_CREATE,
      variables: { input }
    })

    expect(fetchJourneyWithAclIncludes).toHaveBeenCalledWith('journeyId')
    expect(mockAbility).toHaveBeenCalledWith(
      Action.Update,
      { subject: 'Journey', object: { id: 'journeyId' } },
      expect.any(Object)
    )
    expect(tx.block.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        journeyId: 'journeyId',
        parentBlockId: 'parentId',
        typename: 'VideoBlock',
        videoId: 'videoId',
        videoVariantLanguageId: 'langId'
      })
    })
    expect(tx.journey.update).toHaveBeenCalled()

    expect(result).toEqual({
      data: {
        videoBlockCreate: expect.objectContaining({
          id: 'blockId',
          journeyId: 'journeyId'
        })
      }
    })
  })

  it('returns NOT_FOUND if journey missing', async () => {
    fetchJourneyWithAclIncludes.mockResolvedValue(null)
    mockAbility.mockReturnValue(true)

    const result = await authClient({
      document: VIDEO_BLOCK_CREATE,
      variables: { input }
    })

    expect(result).toEqual({
      data: null,
      errors: [expect.objectContaining({ message: 'journey not found' })]
    })
  })

  it('returns FORBIDDEN if unauthorized', async () => {
    fetchJourneyWithAclIncludes.mockResolvedValue({ id: 'journeyId' })
    mockAbility.mockReturnValue(false)

    const result = await authClient({
      document: VIDEO_BLOCK_CREATE,
      variables: { input }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'user is not allowed to create video block'
        })
      ]
    })
  })
})
