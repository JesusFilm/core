import { type MockedFunction, vi } from 'vitest'

import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'
import { Action, ability } from '../../../lib/auth/ability'
import { fetchJourneyWithAclIncludes } from '../../../lib/auth/fetchJourneyWithAclIncludes'
import { graphql } from '../../../lib/graphql/subgraphGraphql'

vi.mock('../../../lib/auth/ability', () => ({
  Action: { Update: 'update' },
  ability: vi.fn(),
  subject: vi.fn((type, object) => ({ subject: type, object }))
}))

vi.mock('../../../lib/auth/fetchJourneyWithAclIncludes', () => ({
  fetchJourneyWithAclIncludes: vi.fn()
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
        showGeneratedSubtitles
        notes
      }
    }
  `)
  const mockAbility = ability as MockedFunction<typeof ability>

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
    posterBlockId: 'posterId',
    notes: 'intro video'
  }

  beforeEach(() => {
    vi.clearAllMocks()
    prismaMock.block.findMany.mockResolvedValue([] as any)
  })

  it('creates video block when authorized', async () => {
    ;(fetchJourneyWithAclIncludes as any).mockResolvedValue({ id: 'journeyId' })
    mockAbility.mockReturnValue(true)

    const tx = {
      block: {
        create: vi.fn().mockResolvedValue({
          id: 'blockId',
          ...input,
          typename: 'VideoBlock',
          parentOrder: 0,
          journey: { id: 'journeyId' }
        }),
        findFirst: vi.fn().mockResolvedValue(null),
        findMany: vi.fn().mockResolvedValue([])
      },
      journey: { update: vi.fn().mockResolvedValue({ id: 'journeyId' }) }
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
    expect(tx.block.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          typename: 'VideoBlock',
          journey: { connect: { id: 'journeyId' } },
          parentBlock: { connect: { id: 'parentId' } }
        })
      })
    )
    expect(tx.journey.update).toHaveBeenCalled()

    expect(result).toEqual({
      data: {
        videoBlockCreate: expect.objectContaining({
          id: 'blockId',
          journeyId: 'journeyId',
          notes: 'intro video'
        })
      }
    })
  })

  it('returns FORBIDDEN if unauthorized', async () => {
    ;(fetchJourneyWithAclIncludes as any).mockResolvedValue({ id: 'journeyId' })
    mockAbility.mockReturnValue(false)

    const result = await authClient({
      document: VIDEO_BLOCK_CREATE,
      variables: { input }
    })

    expect(fetchJourneyWithAclIncludes).toHaveBeenCalledWith('journeyId')
    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'user is not allowed to create block'
        })
      ]
    })
  })
})
