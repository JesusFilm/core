import { MuxSubtitleTrackStatus } from '@core/prisma/media/client'
import { graphql } from '@core/shared/gql'

import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'

import { getMuxTrackByBcp47 } from './service'

jest.mock('./service', () => ({
  getMuxTrackByBcp47: jest.fn()
}))

jest.mock('../video/service', () => ({
  getVideo: jest.fn()
}))

describe('mux/subtitle', () => {
  const authClient = getClient({
    headers: {
      authorization: 'token'
    },
    context: {
      currentUser: {
        id: 'userId'
      }
    }
  })
  const publisherClient = getClient({
    headers: {
      authorization: 'token'
    },
    context: {
      currentRoles: ['publisher'],
      currentUser: {
        id: 'userId'
      }
    }
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('queries', () => {
    describe('getMyGeneratedMuxSubtitleTrack', () => {
      const GET_MY_GENERATED_MUX_SUBTITLE_TRACK = graphql(`
        query GetMyGeneratedMuxSubtitleTrack(
          $muxVideoId: ID!
          $bcp47: String!
          $userGenerated: Boolean
        ) {
          getMyGeneratedMuxSubtitleTrack(
            muxVideoId: $muxVideoId
            bcp47: $bcp47
            userGenerated: $userGenerated
          ) {
            ... on QueryGetMyGeneratedMuxSubtitleTrackSuccess {
              data {
                id
                trackId
                source
                status
                bcp47
                muxVideoId
              }
            }
            ... on Error {
              message
            }
          }
        }
      `)

      it('should return existing subtitle track when found', async () => {
        ;(prismaMock.userMediaRole.findUnique as jest.Mock).mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        ;(prismaMock.muxSubtitleTrack.findFirst as jest.Mock).mockResolvedValue(
          {
            id: 'subtitleTrackId',
            trackId: 'trackId',
            source: 'generated',
            status: MuxSubtitleTrackStatus.ready,
            bcp47: 'en',
            muxVideoId: 'muxVideoId',
            muxVideo: {
              id: 'muxVideoId',
              userId: 'userId'
            }
          }
        )

        const data = await authClient({
          document: GET_MY_GENERATED_MUX_SUBTITLE_TRACK,
          variables: {
            muxVideoId: 'muxVideoId',
            bcp47: 'en'
          }
        })

        expect(data).toHaveProperty(
          'data.getMyGeneratedMuxSubtitleTrack.data.id',
          'subtitleTrackId'
        )
        expect(data).toHaveProperty(
          'data.getMyGeneratedMuxSubtitleTrack.data.trackId',
          'trackId'
        )
        expect(data).toHaveProperty(
          'data.getMyGeneratedMuxSubtitleTrack.data.source',
          'generated'
        )
        expect(data).toHaveProperty(
          'data.getMyGeneratedMuxSubtitleTrack.data.status',
          MuxSubtitleTrackStatus.ready
        )
        expect(data).toHaveProperty(
          'data.getMyGeneratedMuxSubtitleTrack.data.bcp47',
          'en'
        )
        expect(data).toHaveProperty(
          'data.getMyGeneratedMuxSubtitleTrack.data.muxVideoId',
          'muxVideoId'
        )
        expect(prismaMock.muxSubtitleTrack.findFirst).toHaveBeenCalledWith({
          where: { muxVideoId: 'muxVideoId', bcp47: 'en' },
          include: { muxVideo: true }
        })
      })

      it('should create new subtitle track when not found in database', async () => {
        ;(prismaMock.userMediaRole.findUnique as jest.Mock).mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        ;(prismaMock.muxSubtitleTrack.findFirst as jest.Mock).mockResolvedValue(
          null
        )
        ;(prismaMock.muxVideo.findUniqueOrThrow as jest.Mock).mockResolvedValue(
          {
            id: 'muxVideoId',
            assetId: 'assetId',
            userId: 'userId'
          }
        )
        ;(getMuxTrackByBcp47 as jest.Mock).mockResolvedValue({
          id: 'muxTrackId',
          type: 'text',
          language_code: 'en',
          text_source: 'generated_vod',
          status: 'ready'
        })
        ;(prismaMock.muxSubtitleTrack.create as jest.Mock).mockResolvedValue({
          id: 'subtitleTrackId',
          trackId: 'muxTrackId',
          source: 'generated',
          status: MuxSubtitleTrackStatus.ready,
          bcp47: 'en',
          muxVideoId: 'muxVideoId'
        })

        const data = await authClient({
          document: GET_MY_GENERATED_MUX_SUBTITLE_TRACK,
          variables: {
            muxVideoId: 'muxVideoId',
            bcp47: 'en',
            userGenerated: false
          }
        })

        expect(getMuxTrackByBcp47).toHaveBeenCalledWith('assetId', 'en', false)
        expect(prismaMock.muxSubtitleTrack.create).toHaveBeenCalledWith({
          data: {
            muxVideoId: 'muxVideoId',
            bcp47: 'en',
            trackId: 'muxTrackId',
            source: 'generated',
            status: MuxSubtitleTrackStatus.ready
          }
        })
        expect(data).toHaveProperty(
          'data.getMyGeneratedMuxSubtitleTrack.data.id',
          'subtitleTrackId'
        )
        expect(data).toHaveProperty(
          'data.getMyGeneratedMuxSubtitleTrack.data.trackId',
          'muxTrackId'
        )
        expect(data).toHaveProperty(
          'data.getMyGeneratedMuxSubtitleTrack.data.source',
          'generated'
        )
        expect(data).toHaveProperty(
          'data.getMyGeneratedMuxSubtitleTrack.data.status',
          MuxSubtitleTrackStatus.ready
        )
        expect(data).toHaveProperty(
          'data.getMyGeneratedMuxSubtitleTrack.data.bcp47',
          'en'
        )
        expect(data).toHaveProperty(
          'data.getMyGeneratedMuxSubtitleTrack.data.muxVideoId',
          'muxVideoId'
        )
      })

      it('should create subtitle track with processing status', async () => {
        ;(prismaMock.userMediaRole.findUnique as jest.Mock).mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        ;(prismaMock.muxSubtitleTrack.findFirst as jest.Mock).mockResolvedValue(
          null
        )
        ;(prismaMock.muxVideo.findUniqueOrThrow as jest.Mock).mockResolvedValue(
          {
            id: 'muxVideoId',
            assetId: 'assetId',
            userId: 'userId'
          }
        )
        ;(getMuxTrackByBcp47 as jest.Mock).mockResolvedValue({
          id: 'muxTrackId',
          type: 'text',
          language_code: 'en',
          text_source: 'generated_vod',
          status: 'preparing'
        })
        ;(prismaMock.muxSubtitleTrack.create as jest.Mock).mockResolvedValue({
          id: 'subtitleTrackId',
          trackId: 'muxTrackId',
          source: 'generated',
          status: MuxSubtitleTrackStatus.processing,
          bcp47: 'en',
          muxVideoId: 'muxVideoId'
        })

        const data = await authClient({
          document: GET_MY_GENERATED_MUX_SUBTITLE_TRACK,
          variables: {
            muxVideoId: 'muxVideoId',
            bcp47: 'en'
          }
        })

        expect(prismaMock.muxSubtitleTrack.create).toHaveBeenCalledWith({
          data: {
            muxVideoId: 'muxVideoId',
            bcp47: 'en',
            trackId: 'muxTrackId',
            source: 'generated',
            status: MuxSubtitleTrackStatus.processing
          }
        })
        expect(data).toHaveProperty(
          'data.getMyGeneratedMuxSubtitleTrack.data.status',
          MuxSubtitleTrackStatus.processing
        )
        expect(data).toHaveProperty(
          'data.getMyGeneratedMuxSubtitleTrack.data.trackId',
          'muxTrackId'
        )
      })

      it('should create subtitle track with errored status', async () => {
        ;(prismaMock.userMediaRole.findUnique as jest.Mock).mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        ;(prismaMock.muxSubtitleTrack.findFirst as jest.Mock).mockResolvedValue(
          null
        )
        ;(prismaMock.muxVideo.findUniqueOrThrow as jest.Mock).mockResolvedValue(
          {
            id: 'muxVideoId',
            assetId: 'assetId',
            userId: 'userId'
          }
        )
        ;(getMuxTrackByBcp47 as jest.Mock).mockResolvedValue({
          id: 'muxTrackId',
          type: 'text',
          language_code: 'en',
          text_source: 'generated_vod',
          status: 'errored'
        })
        ;(prismaMock.muxSubtitleTrack.create as jest.Mock).mockResolvedValue({
          id: 'subtitleTrackId',
          trackId: 'muxTrackId',
          source: 'generated',
          status: MuxSubtitleTrackStatus.errored,
          bcp47: 'en',
          muxVideoId: 'muxVideoId'
        })

        const data = await authClient({
          document: GET_MY_GENERATED_MUX_SUBTITLE_TRACK,
          variables: {
            muxVideoId: 'muxVideoId',
            bcp47: 'en'
          }
        })

        expect(prismaMock.muxSubtitleTrack.create).toHaveBeenCalledWith({
          data: {
            muxVideoId: 'muxVideoId',
            bcp47: 'en',
            trackId: 'muxTrackId',
            source: 'generated',
            status: MuxSubtitleTrackStatus.errored
          }
        })
        expect(data).toHaveProperty(
          'data.getMyGeneratedMuxSubtitleTrack.data.status',
          MuxSubtitleTrackStatus.errored
        )
        expect(data).toHaveProperty(
          'data.getMyGeneratedMuxSubtitleTrack.data.trackId',
          'muxTrackId'
        )
      })

      it('should update subtitle track status when processing', async () => {
        ;(prismaMock.userMediaRole.findUnique as jest.Mock).mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        ;(prismaMock.muxSubtitleTrack.findFirst as jest.Mock).mockResolvedValue(
          {
            id: 'subtitleTrackId',
            trackId: 'trackId',
            source: 'generated',
            status: MuxSubtitleTrackStatus.processing,
            bcp47: 'en',
            muxVideoId: 'muxVideoId',
            muxVideo: {
              id: 'muxVideoId',
              userId: 'userId'
            }
          }
        )
        ;(prismaMock.muxVideo.findUniqueOrThrow as jest.Mock).mockResolvedValue(
          {
            id: 'muxVideoId',
            assetId: 'assetId',
            userId: 'userId'
          }
        )
        ;(getMuxTrackByBcp47 as jest.Mock).mockResolvedValue({
          id: 'trackId',
          type: 'text',
          language_code: 'en',
          text_source: 'generated_vod',
          status: 'ready'
        })
        ;(prismaMock.muxSubtitleTrack.update as jest.Mock).mockResolvedValue({
          id: 'subtitleTrackId',
          trackId: 'trackId',
          source: 'generated',
          status: MuxSubtitleTrackStatus.ready,
          bcp47: 'en',
          muxVideoId: 'muxVideoId'
        })

        const data = await authClient({
          document: GET_MY_GENERATED_MUX_SUBTITLE_TRACK,
          variables: {
            muxVideoId: 'muxVideoId',
            bcp47: 'en',
            userGenerated: false
          }
        })

        expect(getMuxTrackByBcp47).toHaveBeenCalledWith('assetId', 'en', false)
        expect(prismaMock.muxSubtitleTrack.update).toHaveBeenCalledWith({
          where: { id: 'subtitleTrackId' },
          data: {
            status: MuxSubtitleTrackStatus.ready
          }
        })
        expect(data).toHaveProperty(
          'data.getMyGeneratedMuxSubtitleTrack.data.id',
          'subtitleTrackId'
        )
        expect(data).toHaveProperty(
          'data.getMyGeneratedMuxSubtitleTrack.data.status',
          MuxSubtitleTrackStatus.ready
        )
      })

      it('should update subtitle track from processing to errored', async () => {
        ;(prismaMock.userMediaRole.findUnique as jest.Mock).mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        ;(prismaMock.muxSubtitleTrack.findFirst as jest.Mock).mockResolvedValue(
          {
            id: 'subtitleTrackId',
            trackId: 'trackId',
            source: 'generated',
            status: MuxSubtitleTrackStatus.processing,
            bcp47: 'en',
            muxVideoId: 'muxVideoId',
            muxVideo: {
              id: 'muxVideoId',
              userId: 'userId'
            }
          }
        )
        ;(prismaMock.muxVideo.findUniqueOrThrow as jest.Mock).mockResolvedValue(
          {
            id: 'muxVideoId',
            assetId: 'assetId',
            userId: 'userId'
          }
        )
        ;(getMuxTrackByBcp47 as jest.Mock).mockResolvedValue({
          id: 'trackId',
          type: 'text',
          language_code: 'en',
          text_source: 'generated_vod',
          status: 'errored'
        })
        ;(prismaMock.muxSubtitleTrack.update as jest.Mock).mockResolvedValue({
          id: 'subtitleTrackId',
          trackId: 'trackId',
          source: 'generated',
          status: MuxSubtitleTrackStatus.errored,
          bcp47: 'en',
          muxVideoId: 'muxVideoId'
        })

        const data = await authClient({
          document: GET_MY_GENERATED_MUX_SUBTITLE_TRACK,
          variables: {
            muxVideoId: 'muxVideoId',
            bcp47: 'en'
          }
        })

        expect(prismaMock.muxSubtitleTrack.update).toHaveBeenCalledWith({
          where: { id: 'subtitleTrackId' },
          data: {
            status: MuxSubtitleTrackStatus.errored
          }
        })
        expect(data).toHaveProperty(
          'data.getMyGeneratedMuxSubtitleTrack.data.status',
          MuxSubtitleTrackStatus.errored
        )
        expect(data).toHaveProperty(
          'data.getMyGeneratedMuxSubtitleTrack.data.trackId',
          'trackId'
        )
      })

      it('should use isUserGenerated=true for non-publisher users', async () => {
        ;(prismaMock.userMediaRole.findUnique as jest.Mock).mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: []
        })
        ;(prismaMock.muxSubtitleTrack.findFirst as jest.Mock).mockResolvedValue(
          null
        )
        ;(prismaMock.muxVideo.findUniqueOrThrow as jest.Mock).mockResolvedValue(
          {
            id: 'muxVideoId',
            assetId: 'assetId',
            userId: 'userId'
          }
        )
        ;(getMuxTrackByBcp47 as jest.Mock).mockResolvedValue({
          id: 'muxTrackId',
          type: 'text',
          language_code: 'en',
          text_source: 'generated_vod',
          status: 'ready'
        })
        ;(prismaMock.muxSubtitleTrack.create as jest.Mock).mockResolvedValue({
          id: 'subtitleTrackId',
          trackId: 'muxTrackId',
          source: 'generated',
          status: MuxSubtitleTrackStatus.ready,
          bcp47: 'en',
          muxVideoId: 'muxVideoId'
        })

        await authClient({
          document: GET_MY_GENERATED_MUX_SUBTITLE_TRACK,
          variables: {
            muxVideoId: 'muxVideoId',
            bcp47: 'en'
          }
        })

        expect(getMuxTrackByBcp47).toHaveBeenCalledWith('assetId', 'en', true)
      })

      it('should use userGenerated argument for publisher users', async () => {
        ;(prismaMock.userMediaRole.findUnique as jest.Mock).mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        ;(prismaMock.muxSubtitleTrack.findFirst as jest.Mock).mockResolvedValue(
          null
        )
        ;(prismaMock.muxVideo.findUniqueOrThrow as jest.Mock).mockResolvedValue(
          {
            id: 'muxVideoId',
            assetId: 'assetId',
            userId: 'userId'
          }
        )
        ;(getMuxTrackByBcp47 as jest.Mock).mockResolvedValue({
          id: 'muxTrackId',
          type: 'text',
          language_code: 'en',
          text_source: 'generated_vod',
          status: 'ready'
        })
        ;(prismaMock.muxSubtitleTrack.create as jest.Mock).mockResolvedValue({
          id: 'subtitleTrackId',
          trackId: 'muxTrackId',
          source: 'generated',
          status: MuxSubtitleTrackStatus.ready,
          bcp47: 'en',
          muxVideoId: 'muxVideoId'
        })

        await publisherClient({
          document: GET_MY_GENERATED_MUX_SUBTITLE_TRACK,
          variables: {
            muxVideoId: 'muxVideoId',
            bcp47: 'en',
            userGenerated: false
          }
        })

        expect(getMuxTrackByBcp47).toHaveBeenCalledWith('assetId', 'en', false)
      })

      it('should default to userGenerated=true for publisher when not provided', async () => {
        ;(prismaMock.userMediaRole.findUnique as jest.Mock).mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        ;(prismaMock.muxSubtitleTrack.findFirst as jest.Mock).mockResolvedValue(
          null
        )
        ;(prismaMock.muxVideo.findUniqueOrThrow as jest.Mock).mockResolvedValue(
          {
            id: 'muxVideoId',
            assetId: 'assetId',
            userId: 'userId'
          }
        )
        ;(getMuxTrackByBcp47 as jest.Mock).mockResolvedValue({
          id: 'muxTrackId',
          type: 'text',
          language_code: 'en',
          text_source: 'generated_vod',
          status: 'ready'
        })
        ;(prismaMock.muxSubtitleTrack.create as jest.Mock).mockResolvedValue({
          id: 'subtitleTrackId',
          trackId: 'muxTrackId',
          source: 'generated',
          status: MuxSubtitleTrackStatus.ready,
          bcp47: 'en',
          muxVideoId: 'muxVideoId'
        })

        await publisherClient({
          document: GET_MY_GENERATED_MUX_SUBTITLE_TRACK,
          variables: {
            muxVideoId: 'muxVideoId',
            bcp47: 'en'
          }
        })

        expect(getMuxTrackByBcp47).toHaveBeenCalledWith('assetId', 'en', true)
      })

      it('should throw error when mux asset ID is null', async () => {
        ;(prismaMock.userMediaRole.findUnique as jest.Mock).mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        ;(prismaMock.muxSubtitleTrack.findFirst as jest.Mock).mockResolvedValue(
          null
        )
        ;(prismaMock.muxVideo.findUniqueOrThrow as jest.Mock).mockResolvedValue(
          {
            id: 'muxVideoId',
            assetId: null,
            userId: 'userId'
          }
        )

        const data = (await authClient({
          document: GET_MY_GENERATED_MUX_SUBTITLE_TRACK,
          variables: {
            muxVideoId: 'muxVideoId',
            bcp47: 'en'
          }
        })) as {
          data: any
          errors?: { message: string }[]
        }

        expect(data.data?.getMyGeneratedMuxSubtitleTrack).toHaveProperty(
          'message',
          'Mux asset ID is null'
        )
      })

      it('should throw error when mux track is not found', async () => {
        ;(prismaMock.userMediaRole.findUnique as jest.Mock).mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        ;(prismaMock.muxSubtitleTrack.findFirst as jest.Mock).mockResolvedValue(
          null
        )
        ;(prismaMock.muxVideo.findUniqueOrThrow as jest.Mock).mockResolvedValue(
          {
            id: 'muxVideoId',
            assetId: 'assetId',
            userId: 'userId'
          }
        )
        ;(getMuxTrackByBcp47 as jest.Mock).mockResolvedValue(null)

        const data = (await authClient({
          document: GET_MY_GENERATED_MUX_SUBTITLE_TRACK,
          variables: {
            muxVideoId: 'muxVideoId',
            bcp47: 'en'
          }
        })) as {
          data: any
          errors?: { message: string }[]
        }

        expect(data.data?.getMyGeneratedMuxSubtitleTrack).toHaveProperty(
          'message',
          'Mux track not found'
        )
      })

      it('should throw error when mux track id is null', async () => {
        ;(prismaMock.userMediaRole.findUnique as jest.Mock).mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        ;(prismaMock.muxSubtitleTrack.findFirst as jest.Mock).mockResolvedValue(
          null
        )
        ;(prismaMock.muxVideo.findUniqueOrThrow as jest.Mock).mockResolvedValue(
          {
            id: 'muxVideoId',
            assetId: 'assetId',
            userId: 'userId'
          }
        )
        ;(getMuxTrackByBcp47 as jest.Mock).mockResolvedValue({
          id: null,
          type: 'text',
          language_code: 'en',
          text_source: 'generated_vod',
          status: 'ready'
        })

        const data = (await authClient({
          document: GET_MY_GENERATED_MUX_SUBTITLE_TRACK,
          variables: {
            muxVideoId: 'muxVideoId',
            bcp47: 'en'
          }
        })) as {
          data: any
          errors?: { message: string }[]
        }

        expect(data.data?.getMyGeneratedMuxSubtitleTrack).toHaveProperty(
          'message',
          'Mux track not found'
        )
      })

      it('should throw error when processing track is not found in mux asset', async () => {
        ;(prismaMock.userMediaRole.findUnique as jest.Mock).mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        ;(prismaMock.muxSubtitleTrack.findFirst as jest.Mock).mockResolvedValue(
          {
            id: 'subtitleTrackId',
            trackId: 'trackId',
            source: 'generated',
            status: MuxSubtitleTrackStatus.processing,
            bcp47: 'en',
            muxVideoId: 'muxVideoId',
            muxVideo: {
              id: 'muxVideoId',
              userId: 'userId'
            }
          }
        )
        ;(prismaMock.muxVideo.findUniqueOrThrow as jest.Mock).mockResolvedValue(
          {
            id: 'muxVideoId',
            assetId: 'assetId',
            userId: 'userId'
          }
        )
        ;(getMuxTrackByBcp47 as jest.Mock).mockResolvedValue(null)

        const data = (await authClient({
          document: GET_MY_GENERATED_MUX_SUBTITLE_TRACK,
          variables: {
            muxVideoId: 'muxVideoId',
            bcp47: 'en'
          }
        })) as {
          data: any
          errors?: { message: string }[]
        }

        expect(data.data?.getMyGeneratedMuxSubtitleTrack).toHaveProperty(
          'message',
          'Mux track not found'
        )
      })

      it('should throw error when processing track id is null', async () => {
        ;(prismaMock.userMediaRole.findUnique as jest.Mock).mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        ;(prismaMock.muxSubtitleTrack.findFirst as jest.Mock).mockResolvedValue(
          {
            id: 'subtitleTrackId',
            trackId: 'trackId',
            source: 'generated',
            status: MuxSubtitleTrackStatus.processing,
            bcp47: 'en',
            muxVideoId: 'muxVideoId',
            muxVideo: {
              id: 'muxVideoId',
              userId: 'userId'
            }
          }
        )
        ;(prismaMock.muxVideo.findUniqueOrThrow as jest.Mock).mockResolvedValue(
          {
            id: 'muxVideoId',
            assetId: 'assetId',
            userId: 'userId'
          }
        )
        ;(getMuxTrackByBcp47 as jest.Mock).mockResolvedValue({
          id: null,
          type: 'text',
          language_code: 'en',
          text_source: 'generated_vod',
          status: 'ready'
        })

        const data = (await authClient({
          document: GET_MY_GENERATED_MUX_SUBTITLE_TRACK,
          variables: {
            muxVideoId: 'muxVideoId',
            bcp47: 'en'
          }
        })) as {
          data: any
          errors?: { message: string }[]
        }

        expect(data.data?.getMyGeneratedMuxSubtitleTrack).toHaveProperty(
          'message',
          'Mux track not found'
        )
      })

      it('should throw error when asset ID is null during processing update', async () => {
        ;(prismaMock.userMediaRole.findUnique as jest.Mock).mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        ;(prismaMock.muxSubtitleTrack.findFirst as jest.Mock).mockResolvedValue(
          {
            id: 'subtitleTrackId',
            trackId: 'trackId',
            source: 'generated',
            status: MuxSubtitleTrackStatus.processing,
            bcp47: 'en',
            muxVideoId: 'muxVideoId',
            muxVideo: {
              id: 'muxVideoId',
              userId: 'userId'
            }
          }
        )
        ;(prismaMock.muxVideo.findUniqueOrThrow as jest.Mock).mockResolvedValue(
          {
            id: 'muxVideoId',
            assetId: null,
            userId: 'userId'
          }
        )

        const data = (await authClient({
          document: GET_MY_GENERATED_MUX_SUBTITLE_TRACK,
          variables: {
            muxVideoId: 'muxVideoId',
            bcp47: 'en'
          }
        })) as {
          data: any
          errors?: { message: string }[]
        }

        expect(data.data?.getMyGeneratedMuxSubtitleTrack).toHaveProperty(
          'message',
          'Mux asset ID is null'
        )
      })
    })
  })
})
