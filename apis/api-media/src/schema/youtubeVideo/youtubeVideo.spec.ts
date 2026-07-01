import { type Mock } from 'vitest'

import { graphql } from '@core/shared/gql'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'

function buildRow(overrides: Record<string, unknown> = {}): any {
  return {
    id: 'row-id',
    youtubeVideoId: 'yt-1',
    channelId: 'channel-1',
    reviewState: 'SKIPPED',
    videoId: null,
    languageId: null,
    reasonCode: null,
    reasonNote: null,
    youtubeTitle: null,
    youtubeDescription: null,
    tags: [],
    thumbnailUrl: null,
    playlists: null,
    madeForKids: null,
    ageRestricted: null,
    fileName: null,
    privacyStatus: null,
    publishedAt: null,
    reviewedBy: 'user-id',
    reviewedAt: new Date(),
    matchMethod: null,
    matchConfidence: null,
    lastSyncedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  }
}

describe('youtubeVideo', () => {
  const publisherClient = getClient({
    headers: { authorization: 'token' },
    context: {
      currentRoles: ['publisher'],
      currentUser: { id: 'user-id' }
    }
  })

  const UPSERT = graphql(`
    mutation YoutubeVideoUpsert($input: YoutubeVideoUpsertInput!) {
      youtubeVideoUpsert(input: $input) {
        id
        youtubeVideoId
        channelId
        reviewState
        videoId
        languageId
        youtubeTitle
        youtubeDescription
        tags
        thumbnailUrl
        fileName
        madeForKids
        ageRestricted
        reviewedBy
      }
    }
  `)

  beforeEach(() => {
    vi.clearAllMocks()
    ;(prismaMock.userMediaRole.findUnique as Mock).mockResolvedValue({
      id: 'role-id',
      userId: 'user-id',
      roles: ['publisher']
    } as any)
  })

  describe('youtubeVideoUpsert', () => {
    it('upserts by youtubeVideoId so re-submitting the same video never duplicates', async () => {
      prismaMock.youtubeVideo.upsert.mockResolvedValue(
        buildRow({ youtubeVideoId: 'yt-1', reviewState: 'SKIPPED' })
      )

      const result = await publisherClient({
        document: UPSERT,
        variables: {
          input: {
            youtubeVideoId: 'yt-1',
            channelId: 'channel-1',
            reviewState: 'SKIPPED'
          }
        } as any
      })

      expect(result).toHaveProperty(
        'data.youtubeVideoUpsert.youtubeVideoId',
        'yt-1'
      )
      expect(prismaMock.youtubeVideo.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { youtubeVideoId: 'yt-1' },
          create: expect.objectContaining({ youtubeVideoId: 'yt-1' }),
          update: expect.objectContaining({ channelId: 'channel-1' })
        })
      )
    })

    it('records reviewedBy from the authenticated identity', async () => {
      prismaMock.youtubeVideo.upsert.mockResolvedValue(buildRow())

      await publisherClient({
        document: UPSERT,
        variables: {
          input: {
            youtubeVideoId: 'yt-1',
            channelId: 'channel-1',
            reviewState: 'SKIPPED'
          }
        } as any
      })

      expect(prismaMock.youtubeVideo.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: expect.objectContaining({ reviewedBy: 'testUserId' })
        })
      )
    })

    it('LINKED requires a resolvable variant reference', async () => {
      prismaMock.videoVariant.findUnique.mockResolvedValue({
        id: 'variant-id'
      } as any)
      prismaMock.youtubeVideo.upsert.mockResolvedValue(
        buildRow({
          reviewState: 'LINKED',
          videoId: 'video-1',
          languageId: '529'
        })
      )

      const result = await publisherClient({
        document: UPSERT,
        variables: {
          input: {
            youtubeVideoId: 'yt-1',
            channelId: 'channel-1',
            reviewState: 'LINKED',
            videoId: 'video-1',
            languageId: '529'
          }
        } as any
      })

      expect(result).toHaveProperty(
        'data.youtubeVideoUpsert.reviewState',
        'LINKED'
      )
      expect(prismaMock.videoVariant.findUnique).toHaveBeenCalledWith({
        where: {
          languageId_videoId: { languageId: '529', videoId: 'video-1' }
        },
        select: { id: true }
      })
    })

    it('rejects a LINKED row whose variant does not exist', async () => {
      prismaMock.videoVariant.findUnique.mockResolvedValue(null)

      const result = await publisherClient({
        document: UPSERT,
        variables: {
          input: {
            youtubeVideoId: 'yt-1',
            channelId: 'channel-1',
            reviewState: 'LINKED',
            videoId: 'missing',
            languageId: '529'
          }
        } as any
      })

      expect((result as any).errors?.[0].message).toContain(
        'no catalog variant'
      )
      expect(prismaMock.youtubeVideo.upsert).not.toHaveBeenCalled()
    })

    it('rejects a LINKED row missing videoId/languageId', async () => {
      const result = await publisherClient({
        document: UPSERT,
        variables: {
          input: {
            youtubeVideoId: 'yt-1',
            channelId: 'channel-1',
            reviewState: 'LINKED'
          }
        } as any
      })

      expect((result as any).errors?.[0].message).toContain(
        'LINKED youtube video requires'
      )
      expect(prismaMock.youtubeVideo.upsert).not.toHaveBeenCalled()
    })

    it('rejects a DISMISSED row that references a variant', async () => {
      const result = await publisherClient({
        document: UPSERT,
        variables: {
          input: {
            youtubeVideoId: 'yt-1',
            channelId: 'channel-1',
            reviewState: 'DISMISSED',
            videoId: 'video-1',
            languageId: '529'
          }
        } as any
      })

      expect((result as any).errors?.[0].message).toContain(
        'must not reference a variant'
      )
      expect(prismaMock.youtubeVideo.upsert).not.toHaveBeenCalled()
    })

    it('rejects a SKIPPED row that references a variant', async () => {
      const result = await publisherClient({
        document: UPSERT,
        variables: {
          input: {
            youtubeVideoId: 'yt-1',
            channelId: 'channel-1',
            reviewState: 'SKIPPED',
            videoId: 'video-1',
            languageId: '529'
          }
        } as any
      })

      expect((result as any).errors?.[0].message).toContain(
        'must not reference a variant'
      )
      expect(prismaMock.youtubeVideo.upsert).not.toHaveBeenCalled()
    })

    it('allows many LINKED rows to point at the same variant', async () => {
      prismaMock.videoVariant.findUnique.mockResolvedValue({
        id: 'variant-id'
      } as any)
      prismaMock.youtubeVideo.upsert.mockResolvedValue(
        buildRow({
          reviewState: 'LINKED',
          videoId: 'video-1',
          languageId: '529'
        })
      )

      const link = (youtubeVideoId: string) =>
        publisherClient({
          document: UPSERT,
          variables: {
            input: {
              youtubeVideoId,
              channelId: 'channel-1',
              reviewState: 'LINKED',
              videoId: 'video-1',
              languageId: '529'
            }
          } as any
        })

      const first = await link('yt-a')
      const second = await link('yt-b')

      expect((first as any).errors).toBeUndefined()
      expect((second as any).errors).toBeUndefined()
      expect(prismaMock.youtubeVideo.upsert).toHaveBeenCalledTimes(2)
    })

    it('stores the full captured facts on a SKIPPED row without touching canonical fields', async () => {
      prismaMock.youtubeVideo.upsert.mockResolvedValue(
        buildRow({
          reviewState: 'SKIPPED',
          youtubeTitle: 'Live YouTube title',
          youtubeDescription: 'Live YouTube description',
          tags: ['jesus', 'film'],
          thumbnailUrl: 'https://i.ytimg.com/vi/yt-1/maxres.jpg',
          fileName: 'JF_001_en.mp4',
          madeForKids: false,
          ageRestricted: true
        })
      )

      await publisherClient({
        document: UPSERT,
        variables: {
          input: {
            youtubeVideoId: 'yt-1',
            channelId: 'channel-1',
            reviewState: 'SKIPPED',
            youtubeTitle: 'Live YouTube title',
            youtubeDescription: 'Live YouTube description',
            tags: ['jesus', 'film'],
            thumbnailUrl: 'https://i.ytimg.com/vi/yt-1/maxres.jpg',
            fileName: 'JF_001_en.mp4',
            madeForKids: false,
            ageRestricted: true
          }
        } as any
      })

      const data = (prismaMock.youtubeVideo.upsert as Mock).mock.calls[0][0]
        .update
      expect(data).toEqual(
        expect.objectContaining({
          youtubeTitle: 'Live YouTube title',
          youtubeDescription: 'Live YouTube description',
          tags: ['jesus', 'film'],
          thumbnailUrl: 'https://i.ytimg.com/vi/yt-1/maxres.jpg',
          fileName: 'JF_001_en.mp4',
          madeForKids: false,
          ageRestricted: true
        })
      )
      expect(data).not.toHaveProperty('title')
      expect(data).not.toHaveProperty('description')
    })
  })

  describe('youtubeVideoDelete', () => {
    const DELETE = graphql(`
      mutation YoutubeVideoDelete($youtubeVideoId: ID!) {
        youtubeVideoDelete(youtubeVideoId: $youtubeVideoId)
      }
    `)

    it('removes the row', async () => {
      prismaMock.youtubeVideo.delete.mockResolvedValue(buildRow())

      const result = await publisherClient({
        document: DELETE,
        variables: { youtubeVideoId: 'yt-1' } as any
      })

      expect(result).toHaveProperty('data.youtubeVideoDelete', true)
      expect(prismaMock.youtubeVideo.delete).toHaveBeenCalledWith({
        where: { youtubeVideoId: 'yt-1' }
      })
    })
  })

  describe('youtubeVideos', () => {
    const LIST = graphql(`
      query YoutubeVideos($channelId: ID!, $offset: Int, $limit: Int) {
        youtubeVideos(channelId: $channelId, offset: $offset, limit: $limit) {
          youtubeVideoId
          reviewState
        }
      }
    `)

    it('returns a paginated list of rows for the channel', async () => {
      prismaMock.youtubeVideo.findMany.mockResolvedValue([
        buildRow({ youtubeVideoId: 'yt-1', reviewState: 'SKIPPED' }),
        buildRow({ youtubeVideoId: 'yt-2', reviewState: 'LINKED' })
      ])

      const result = await publisherClient({
        document: LIST,
        variables: { channelId: 'channel-1', offset: 0, limit: 10 } as any
      })

      expect(result).toHaveProperty('data.youtubeVideos', [
        { youtubeVideoId: 'yt-1', reviewState: 'SKIPPED' },
        { youtubeVideoId: 'yt-2', reviewState: 'LINKED' }
      ])
      expect(prismaMock.youtubeVideo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { channelId: 'channel-1' },
          skip: 0,
          take: 10
        })
      )
    })

    it('returns every row when limit is omitted (resume-diff reads the full set)', async () => {
      prismaMock.youtubeVideo.findMany.mockResolvedValue([
        buildRow({ youtubeVideoId: 'yt-1', reviewState: 'SKIPPED' })
      ])

      const result = await publisherClient({
        document: LIST,
        variables: { channelId: 'channel-1' } as any
      })

      expect((result as any).errors).toBeUndefined()
      expect(prismaMock.youtubeVideo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: undefined, skip: undefined })
      )
    })

    it('rejects a negative offset', async () => {
      const result = await publisherClient({
        document: LIST,
        variables: { channelId: 'channel-1', offset: -1 } as any
      })

      expect((result as any).errors?.[0].message).toContain(
        'offset must not be negative'
      )
      expect(prismaMock.youtubeVideo.findMany).not.toHaveBeenCalled()
    })

    it('rejects a limit above the maximum page size', async () => {
      const result = await publisherClient({
        document: LIST,
        variables: { channelId: 'channel-1', limit: 5000 } as any
      })

      expect((result as any).errors?.[0].message).toContain(
        'limit must be between'
      )
      expect(prismaMock.youtubeVideo.findMany).not.toHaveBeenCalled()
    })
  })

  describe('youtubeVideoByVideoId', () => {
    const BY_ID = graphql(`
      query YoutubeVideoByVideoId($youtubeVideoId: ID!) {
        youtubeVideoByVideoId(youtubeVideoId: $youtubeVideoId) {
          youtubeVideoId
          reviewState
        }
      }
    `)

    it('returns the row for a single youtubeVideoId', async () => {
      prismaMock.youtubeVideo.findUnique.mockResolvedValue(
        buildRow({ youtubeVideoId: 'yt-1', reviewState: 'LINKED' })
      )

      const result = await publisherClient({
        document: BY_ID,
        variables: { youtubeVideoId: 'yt-1' } as any
      })

      expect(result).toHaveProperty('data.youtubeVideoByVideoId', {
        youtubeVideoId: 'yt-1',
        reviewState: 'LINKED'
      })
    })
  })
})
