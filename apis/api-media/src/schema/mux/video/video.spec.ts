import { type Mock, vi } from 'vitest'

import { MuxVideo } from '@core/prisma/media/client'
import { graphql } from '@core/shared/gql'

import { getClient } from '../../../../test/client'
import { journeysPrismaMock } from '../../../../test/journeysPrismaMock'
import { prismaMock } from '../../../../test/prismaMock'
import { notifyMediaSlackOfOperationFailure } from '../../../lib/slack'

import { enableDownload } from './service'

// Mock the processVideoDownloads queue

vi.mock('./service', () => {
  return {
    createVideoByDirectUpload: vi.fn().mockResolvedValue({
      id: 'uploadId',
      uploadUrl: 'https://example.com/video.mp4'
    }),
    createVideoFromUrl: vi.fn().mockResolvedValue({
      id: 'assetId'
    }),
    getVideo: vi.fn().mockResolvedValue({
      id: 'assetId',
      status: 'ready',
      playback_ids: [{ id: 'playbackId' }],
      duration: 10
    }),
    deleteVideo: vi.fn().mockResolvedValue({
      id: 'assetId'
    }),
    enableDownload: vi.fn().mockResolvedValue(undefined),
    getUpload: vi.fn().mockResolvedValue({
      asset_id: 'assetId'
    }),
    getMaxResolutionValue: vi
      .fn()
      .mockImplementation((maxResolution: string | null | undefined) => {
        if (!maxResolution) return undefined
        if (maxResolution === 'fhd') return '1080p'
        if (maxResolution === 'qhd') return '1440p'
        if (maxResolution === 'uhd') return '2160p'
        return '1080p' // fallback
      }),
    isValidMaxResolutionTier: vi.fn().mockImplementation((value: string) => {
      return ['fhd', 'qhd', 'uhd'].includes(value)
    })
  }
})

vi.mock('../../../workers/processVideoDownloads/queue', () => ({
  queue: {
    add: vi.fn().mockResolvedValue({ id: 'job-id' })
  }
}))

vi.mock('../../../lib/slack', () => ({
  notifyMediaSlackOfOperationFailure: vi.fn()
}))

const mockedNotifyMediaSlackOfOperationFailure = vi.mocked(
  notifyMediaSlackOfOperationFailure
)

describe('mux/video', () => {
  const client = getClient()
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

  beforeEach(async () => {
    vi.clearAllMocks()
    mockedNotifyMediaSlackOfOperationFailure.mockClear()
    const { queue } = await vi.importMock<any>(
      '../../../workers/processVideoDownloads/queue'
    )
    queue.add.mockResolvedValue({ id: 'job-id' })
  })

  describe('queries', () => {
    describe('getMyMuxVideos', () => {
      const GET_MY_MUX_VIDEOS = graphql(`
        query GetMyMuxVideos($offset: Int, $limit: Int) {
          getMyMuxVideos(offset: $offset, limit: $limit) {
            id
            playbackId
            uploadUrl
            userId
            readyToStream
            videoVariants {
              id
            }
          }
        }
      `)

      it('should return video', async () => {
        ;(prismaMock.userMediaRole.findUnique as Mock).mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        ;(prismaMock.muxVideo.findMany as Mock).mockResolvedValue([
          {
            id: 'videoId',
            playbackId: 'playbackId',
            uploadId: 'uploadId',
            assetId: 'assetId',
            duration: 10,
            name: 'videoName',
            uploadUrl: 'https://example.com/video.mp4',
            userId: 'userId',
            createdAt: new Date(),
            readyToStream: true,
            downloadable: false,
            updatedAt: new Date(),
            videoVariants: []
          } as unknown as MuxVideo
        ])
        const data = await authClient({
          document: GET_MY_MUX_VIDEOS,
          variables: {
            offset: 0,
            limit: 10
          }
        })
        expect(data).toHaveProperty('data.getMyMuxVideos', [
          {
            id: 'videoId',
            playbackId: 'playbackId',
            uploadUrl: 'https://example.com/video.mp4',
            userId: 'userId',
            readyToStream: true,
            videoVariants: []
          }
        ])
        expect(prismaMock.muxVideo.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: {
              userId: 'testUserId',
              readyToStream: true,
              playbackId: { not: null }
            },
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
            take: 10,
            skip: 0
          })
        )
      })

      it('should return null when not authorized', async () => {
        const data = await client({
          document: GET_MY_MUX_VIDEOS,
          variables: {
            offset: 0,
            limit: 10
          }
        })
        expect(data).toHaveProperty('data', null)
      })

      it('should apply readyToStream and playbackId filter when pagination args are omitted', async () => {
        ;(prismaMock.userMediaRole.findUnique as Mock).mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        ;(prismaMock.muxVideo.findMany as Mock).mockResolvedValue([])

        await authClient({
          document: GET_MY_MUX_VIDEOS,
          variables: {}
        })

        expect(prismaMock.muxVideo.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: {
              userId: 'testUserId',
              readyToStream: true,
              playbackId: { not: null }
            },
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
            take: undefined,
            skip: undefined
          })
        )
      })

      it('should preserve readyToStream and playbackId filter across non-zero pagination args', async () => {
        ;(prismaMock.userMediaRole.findUnique as Mock).mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        ;(prismaMock.muxVideo.findMany as Mock).mockResolvedValue([])

        await authClient({
          document: GET_MY_MUX_VIDEOS,
          variables: {
            offset: 20,
            limit: 5
          }
        })

        expect(prismaMock.muxVideo.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: {
              userId: 'testUserId',
              readyToStream: true,
              playbackId: { not: null }
            },
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
            take: 5,
            skip: 20
          })
        )
      })

      it('should return an empty array when findMany returns no results', async () => {
        ;(prismaMock.userMediaRole.findUnique as Mock).mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        ;(prismaMock.muxVideo.findMany as Mock).mockResolvedValue([])

        const data = await authClient({
          document: GET_MY_MUX_VIDEOS,
          variables: {
            offset: 0,
            limit: 10
          }
        })

        expect(data).toHaveProperty('data.getMyMuxVideos', [])
      })

      const GET_MY_MUX_VIDEOS_TEAM = graphql(`
        query GetMyMuxVideosTeam($teamId: ID) {
          getMyMuxVideos(teamId: $teamId) {
            id
          }
        }
      `)

      it('should return the merged personal + team result when caller is a member', async () => {
        ;(prismaMock.userMediaRole.findUnique as Mock).mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        journeysPrismaMock.userTeam.findUnique.mockResolvedValue({
          id: 'userTeamId'
        } as never)
        ;(prismaMock.muxVideo.findMany as Mock).mockResolvedValue([])

        await authClient({
          document: GET_MY_MUX_VIDEOS_TEAM,
          variables: { teamId: 'teamId' }
        })

        expect(journeysPrismaMock.userTeam.findUnique).toHaveBeenCalledWith({
          where: { teamId_userId: { teamId: 'teamId', userId: 'testUserId' } }
        })
        expect(prismaMock.muxVideo.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: {
              OR: [{ userId: 'testUserId' }, { teamId: 'teamId' }],
              readyToStream: true,
              playbackId: { not: null }
            },
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }]
          })
        )
      })

      it('should throw FORBIDDEN when caller is not a member of the team', async () => {
        ;(prismaMock.userMediaRole.findUnique as Mock).mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        journeysPrismaMock.userTeam.findUnique.mockResolvedValue(null)

        const result = (await authClient({
          document: GET_MY_MUX_VIDEOS_TEAM,
          variables: { teamId: 'teamId' }
        })) as {
          data: unknown
          errors?: { extensions?: { code?: string } }[]
        }

        expect(result.errors?.[0]?.extensions?.code).toBe('FORBIDDEN')
        expect(prismaMock.muxVideo.findMany).not.toHaveBeenCalled()
      })
    })

    describe('getMyMuxVideo', () => {
      const GET_MY_MUX_VIDEO = graphql(`
        query GetMyMuxVideo($id: ID!, $userGenerated: Boolean) {
          getMyMuxVideo(id: $id, userGenerated: $userGenerated) {
            id
            playbackId
            uploadUrl
            userId
            readyToStream
          }
        }
      `)

      it('should return video', async () => {
        ;(prismaMock.userMediaRole.findUnique as Mock).mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        ;(prismaMock.muxVideo.findFirstOrThrow as Mock).mockResolvedValue({
          id: 'videoId',
          playbackId: 'playbackId',
          uploadId: 'uploadId',
          assetId: 'assetId',
          duration: 10,
          name: 'videoName',
          uploadUrl: 'https://example.com/video.mp4',
          userId: 'userId',
          createdAt: new Date(),
          readyToStream: true,
          downloadable: false,
          updatedAt: new Date()
        })
        const data = await authClient({
          document: GET_MY_MUX_VIDEO,
          variables: {
            id: 'videoId',
            userGenerated: true
          }
        })
        expect(data).toHaveProperty('data.getMyMuxVideo', {
          id: 'videoId',
          playbackId: 'playbackId',
          uploadUrl: 'https://example.com/video.mp4',
          userId: 'userId',
          readyToStream: true
        })
      })

      it('should return null when not authorized', async () => {
        const data = await client({
          document: GET_MY_MUX_VIDEO,
          variables: {
            id: 'videoId',
            userGenerated: true
          }
        })
        expect(data).toHaveProperty('data', null)
      })

      it('should queue download processing when video is downloadable and ready', async () => {
        const { getVideo } = await vi.importMock<any>('./service')

        ;(prismaMock.userMediaRole.findUnique as Mock).mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })

        // First call returns video without playbackId to trigger getVideo call
        ;(prismaMock.muxVideo.findFirstOrThrow as Mock).mockResolvedValue({
          id: 'videoId',
          playbackId: null,
          uploadId: 'uploadId',
          assetId: 'assetId',
          duration: 10,
          name: 'videoName',
          uploadUrl: 'https://example.com/video.mp4',
          userId: 'userId',
          createdAt: new Date(),
          readyToStream: false,
          downloadable: true,
          updatedAt: new Date()
        })

        // Mock the updated video after getVideo call
        ;(prismaMock.muxVideo.update as Mock).mockResolvedValue({
          id: 'videoId',
          playbackId: 'playbackId',
          uploadId: 'uploadId',
          assetId: 'assetId',
          duration: 10,
          name: 'videoName',
          uploadUrl: 'https://example.com/video.mp4',
          userId: 'userId',
          createdAt: new Date(),
          readyToStream: true,
          downloadable: true,
          updatedAt: new Date()
        })

        const data = await authClient({
          document: GET_MY_MUX_VIDEO,
          variables: {
            id: 'videoId',
            userGenerated: false
          }
        })

        expect(getVideo).toHaveBeenCalledWith('assetId', false)
        expect(prismaMock.muxVideo.update).toHaveBeenCalledWith({
          where: { id: 'videoId' },
          data: {
            readyToStream: true,
            playbackId: 'playbackId',
            duration: 10
          }
        })
        const { queue } = await vi.importMock<any>(
          '../../../workers/processVideoDownloads/queue'
        )
        expect(queue.add).toHaveBeenCalledWith(
          'process-video-downloads',
          {
            videoId: 'videoId',
            assetId: 'assetId',
            isUserGenerated: false
          },
          {
            jobId: 'download:videoId',
            attempts: 3,
            backoff: { type: 'exponential', delay: 1000 },
            removeOnComplete: true,
            removeOnFail: { age: 432000, count: 50 }
          }
        )
        expect(data).toHaveProperty('data.getMyMuxVideo.readyToStream', true)
      })

      it('should not queue download processing when video is not downloadable', async () => {
        const { getVideo } = await vi.importMock<any>('./service')

        ;(prismaMock.userMediaRole.findUnique as Mock).mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        ;(prismaMock.muxVideo.findFirstOrThrow as Mock).mockResolvedValue({
          id: 'videoId',
          playbackId: null,
          uploadId: 'uploadId',
          assetId: 'assetId',
          duration: 10,
          name: 'videoName',
          uploadUrl: 'https://example.com/video.mp4',
          userId: 'userId',
          createdAt: new Date(),
          readyToStream: false,
          downloadable: false, // Not downloadable
          updatedAt: new Date()
        })
        ;(prismaMock.muxVideo.update as Mock).mockResolvedValue({
          id: 'videoId',
          playbackId: 'playbackId',
          uploadId: 'uploadId',
          assetId: 'assetId',
          duration: 10,
          name: 'videoName',
          uploadUrl: 'https://example.com/video.mp4',
          userId: 'userId',
          createdAt: new Date(),
          readyToStream: true,
          downloadable: false,
          updatedAt: new Date()
        })

        await authClient({
          document: GET_MY_MUX_VIDEO,
          variables: {
            id: 'videoId',
            userGenerated: false
          }
        })

        expect(getVideo).toHaveBeenCalledWith('assetId', false)
        expect(prismaMock.muxVideo.update).toHaveBeenCalled()
        const { queue } = await vi.importMock<any>(
          '../../../workers/processVideoDownloads/queue'
        )
        expect(queue.add).not.toHaveBeenCalled()
      })

      it('should handle queue errors gracefully', async () => {
        const consoleSpy = vi
          .spyOn(console, 'error')
          .mockImplementation(() => undefined)

        ;(prismaMock.userMediaRole.findUnique as Mock).mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        ;(prismaMock.muxVideo.findFirstOrThrow as Mock).mockResolvedValue({
          id: 'videoId',
          playbackId: null,
          uploadId: 'uploadId',
          assetId: 'assetId',
          duration: 10,
          name: 'videoName',
          uploadUrl: 'https://example.com/video.mp4',
          userId: 'userId',
          createdAt: new Date(),
          readyToStream: false,
          downloadable: true,
          updatedAt: new Date()
        })
        ;(prismaMock.muxVideo.update as Mock).mockResolvedValue({
          id: 'videoId',
          playbackId: 'playbackId',
          uploadId: 'uploadId',
          assetId: 'assetId',
          duration: 10,
          name: 'videoName',
          uploadUrl: 'https://example.com/video.mp4',
          userId: 'userId',
          createdAt: new Date(),
          readyToStream: true,
          downloadable: true,
          updatedAt: new Date()
        })

        // Mock queue to throw error
        const { queue } = await vi.importMock<any>(
          '../../../workers/processVideoDownloads/queue'
        )
        queue.add.mockRejectedValueOnce(new Error('Queue connection failed'))

        const data = await authClient({
          document: GET_MY_MUX_VIDEO,
          variables: {
            id: 'videoId',
            userGenerated: false
          }
        })

        expect(queue.add).toHaveBeenCalledWith(
          'process-video-downloads',
          {
            videoId: 'videoId',
            assetId: 'assetId',
            isUserGenerated: false
          },
          {
            jobId: 'download:videoId',
            attempts: 3,
            backoff: { type: 'exponential', delay: 1000 },
            removeOnComplete: true,
            removeOnFail: { age: 432000, count: 50 }
          }
        )
        expect(consoleSpy).toHaveBeenCalledWith(
          'Failed to queue video downloads processing:',
          expect.any(Error)
        )
        // Should still return the video even if queue fails
        expect(data).toHaveProperty('data.getMyMuxVideo.readyToStream', true)

        consoleSpy.mockRestore()
      })
    })

    describe('getMuxVideo', () => {
      const GET_MUX_VIDEO = graphql(`
        query GetMuxVideo($id: ID!, $userGenerated: Boolean) {
          getMuxVideo(id: $id, userGenerated: $userGenerated) {
            id
            playbackId
            uploadUrl
            userId
            readyToStream
          }
        }
      `)

      it('should return video', async () => {
        ;(prismaMock.userMediaRole.findUnique as Mock).mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        ;(prismaMock.muxVideo.findFirstOrThrow as Mock).mockResolvedValue({
          id: 'videoId',
          playbackId: 'playbackId',
          uploadId: 'uploadId',
          assetId: 'assetId',
          duration: 10,
          name: 'videoName',
          uploadUrl: 'https://example.com/video.mp4',
          userId: 'userId',
          createdAt: new Date(),
          readyToStream: true,
          downloadable: false,
          updatedAt: new Date()
        })
        const data = await authClient({
          document: GET_MUX_VIDEO,
          variables: {
            id: 'videoId',
            userGenerated: false
          }
        })
        expect(data).toHaveProperty('data.getMuxVideo', {
          id: 'videoId',
          playbackId: 'playbackId',
          uploadUrl: 'https://example.com/video.mp4',
          userId: 'userId',
          readyToStream: true
        })
      })
    })
  })

  describe('mutations', () => {
    describe('createMuxVideoUploadByFile', () => {
      const CREATE_MUX_VIDEO_UPLOAD_BY_FILE = graphql(`
        mutation CreateMuxVideoUploadByFile(
          $name: String!
          $userGenerated: Boolean
          $maxResolution: MaxResolutionTier
          $generateSubtitlesInput: GenerateSubtitlesInput
        ) {
          createMuxVideoUploadByFile(
            name: $name
            userGenerated: $userGenerated
            maxResolution: $maxResolution
            generateSubtitlesInput: $generateSubtitlesInput
          ) {
            id
            playbackId
            uploadUrl
            userId
            readyToStream
          }
        }
      `)

      it('should create a new video', async () => {
        ;(prismaMock.userMediaRole.findUnique as Mock).mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        ;(prismaMock.muxVideo.create as Mock).mockResolvedValue({
          id: 'videoId',
          playbackId: 'playbackId',
          uploadId: 'uploadId',
          assetId: 'assetId',
          duration: 10,
          name: 'videoName',
          uploadUrl: 'https://example.com/video.mp4',
          userId: 'testUserId',
          createdAt: new Date(),
          readyToStream: true,
          downloadable: false,
          updatedAt: new Date()
        })
        const result = await authClient({
          document: CREATE_MUX_VIDEO_UPLOAD_BY_FILE,
          variables: {
            name: 'videoName',
            userGenerated: true,
            maxResolution: 'fhd'
          }
        })
        expect(prismaMock.muxVideo.create).toHaveBeenCalledWith({
          data: {
            name: 'videoName',
            uploadUrl: 'https://example.com/video.mp4',
            uploadId: 'uploadId',
            userId: 'testUserId',
            downloadable: false,
            teamId: null
          }
        })
        expect(result).toHaveProperty('data.createMuxVideoUploadByFile', {
          id: 'videoId',
          playbackId: 'playbackId',
          uploadUrl: 'https://example.com/video.mp4',
          userId: 'testUserId',
          readyToStream: true
        })
      })

      it('should fail if not publisher', async () => {
        const result = await client({
          document: CREATE_MUX_VIDEO_UPLOAD_BY_FILE,
          variables: {
            name: 'videoName',
            userGenerated: true,
            maxResolution: 'qhd'
          }
        })
        expect(result).toHaveProperty('data', null)
      })

      const CREATE_BY_FILE_WITH_JOURNEY = graphql(`
        mutation CreateMuxVideoUploadByFileWithJourney(
          $name: String!
          $journeyId: ID
        ) {
          createMuxVideoUploadByFile(name: $name, journeyId: $journeyId) {
            id
          }
        }
      `)

      it('should persist teamId from the journey when journeyId is provided', async () => {
        ;(prismaMock.userMediaRole.findUnique as Mock).mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        journeysPrismaMock.journey.findUnique.mockResolvedValue({
          teamId: 'teamId',
          team: { userTeams: [{ id: 'userTeamId' }] }
        } as never)
        ;(prismaMock.muxVideo.create as Mock).mockResolvedValue({
          id: 'videoId'
        })

        await authClient({
          document: CREATE_BY_FILE_WITH_JOURNEY,
          variables: { name: 'videoName', journeyId: 'journeyId' }
        })

        expect(prismaMock.muxVideo.create).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({ teamId: 'teamId' })
          })
        )
      })

      it('should not create a row when caller lacks access to the journey team', async () => {
        ;(prismaMock.userMediaRole.findUnique as Mock).mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        journeysPrismaMock.journey.findUnique.mockResolvedValue({
          teamId: 'teamId',
          team: { userTeams: [] }
        } as never)

        const result = (await authClient({
          document: CREATE_BY_FILE_WITH_JOURNEY,
          variables: { name: 'videoName', journeyId: 'journeyId' }
        })) as {
          data: unknown
          errors?: { extensions?: { code?: string } }[]
        }

        expect(result.errors?.[0]?.extensions?.code).toBe('FORBIDDEN')
        expect(prismaMock.muxVideo.create).not.toHaveBeenCalled()
      })

      it('should create video with generated subtitles when generateSubtitlesInput is provided', async () => {
        const { createVideoByDirectUpload } =
          await vi.importMock<any>('./service')

        ;(prismaMock.userMediaRole.findUnique as Mock).mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        ;(prismaMock.muxVideo.create as Mock).mockResolvedValue({
          id: 'videoId',
          playbackId: 'playbackId',
          uploadId: 'uploadId',
          assetId: 'assetId',
          duration: 10,
          name: 'videoName',
          uploadUrl: 'https://example.com/video.mp4',
          userId: 'testUserId',
          createdAt: new Date(),
          readyToStream: true,
          downloadable: false,
          updatedAt: new Date()
        })
        const result = await authClient({
          document: CREATE_MUX_VIDEO_UPLOAD_BY_FILE,
          variables: {
            name: 'videoName',
            userGenerated: true,
            maxResolution: 'fhd',
            generateSubtitlesInput: {
              languageCode: 'en',
              languageName: 'English'
            }
          }
        })
        expect(createVideoByDirectUpload).toHaveBeenCalledWith(
          true,
          '1080p',
          false,
          { languageCode: 'en', languageName: 'English' }
        )
        expect(result).toHaveProperty('data.createMuxVideoUploadByFile', {
          id: 'videoId',
          playbackId: 'playbackId',
          uploadUrl: 'https://example.com/video.mp4',
          userId: 'testUserId',
          readyToStream: true
        })
      })

      it('should throw error when invalid language code is provided', async () => {
        ;(prismaMock.userMediaRole.findUnique as Mock).mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })

        const { createVideoByDirectUpload } =
          await vi.importMock<any>('./service')
        ;(createVideoByDirectUpload as Mock).mockRejectedValue(
          new Error('Invalid language code: invalid')
        )

        const result = (await authClient({
          document: CREATE_MUX_VIDEO_UPLOAD_BY_FILE,
          variables: {
            name: 'videoName',
            userGenerated: true,
            maxResolution: 'fhd',
            generateSubtitlesInput: {
              languageCode: 'invalid',
              languageName: 'Invalid'
            } as any
          }
        })) as {
          data: any
          errors?: { message: string }[]
        }

        expect(result).toHaveProperty('data', null)
        expect(result.errors?.[0]?.message).toContain(
          'Invalid language code: invalid'
        )
        expect(mockedNotifyMediaSlackOfOperationFailure).toHaveBeenCalledWith({
          operation: 'Mux direct upload create failed',
          error: expect.any(Error),
          context: {
            name: 'videoName',
            userId: 'testUserId',
            userGenerated: true,
            downloadable: false
          }
        })
      })
    })

    describe('createMuxVideoUploadByUrl', () => {
      const CREATE_MUX_VIDEO_UPLOAD_BY_URL = graphql(`
        mutation CreateMuxVideoUploadByUrl(
          $url: String!
          $userGenerated: Boolean
          $maxResolution: MaxResolutionTier
        ) {
          createMuxVideoUploadByUrl(
            url: $url
            userGenerated: $userGenerated
            maxResolution: $maxResolution
          ) {
            id
            playbackId
            uploadUrl
            userId
            readyToStream
          }
        }
      `)

      it('should return video', async () => {
        ;(prismaMock.userMediaRole.findUnique as Mock).mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        ;(prismaMock.muxVideo.create as Mock).mockResolvedValue({
          id: 'videoId',
          playbackId: 'playbackId',
          uploadId: 'uploadId',
          assetId: 'assetId',
          duration: 10,
          name: 'videoName',
          uploadUrl: null,
          userId: 'testUserId',
          createdAt: new Date(),
          readyToStream: true,
          downloadable: false,
          updatedAt: new Date()
        })
        const result = await authClient({
          document: CREATE_MUX_VIDEO_UPLOAD_BY_URL,
          variables: {
            url: 'https://example.com/video.mp4',
            userGenerated: true,
            maxResolution: 'uhd'
          }
        })
        expect(prismaMock.muxVideo.create).toHaveBeenCalledWith({
          data: {
            assetId: 'assetId',
            userId: 'testUserId',
            downloadable: false,
            teamId: null
          }
        })
        expect(result).toHaveProperty('data.createMuxVideoUploadByUrl', {
          id: 'videoId',
          playbackId: 'playbackId',
          uploadUrl: null,
          userId: 'testUserId',
          readyToStream: true
        })
      })

      it('should fail if not publisher', async () => {
        const result = await client({
          document: CREATE_MUX_VIDEO_UPLOAD_BY_URL,
          variables: {
            url: 'https://example.com/video.mp4',
            userGenerated: true,
            maxResolution: 'fhd'
          }
        })
        expect(result).toHaveProperty('data', null)
      })

      const CREATE_BY_URL_WITH_JOURNEY = graphql(`
        mutation CreateMuxVideoUploadByUrlWithJourney(
          $url: String!
          $journeyId: ID
        ) {
          createMuxVideoUploadByUrl(url: $url, journeyId: $journeyId) {
            id
          }
        }
      `)

      it('should persist teamId from the journey when journeyId is provided', async () => {
        ;(prismaMock.userMediaRole.findUnique as Mock).mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        journeysPrismaMock.journey.findUnique.mockResolvedValue({
          teamId: 'teamId',
          team: { userTeams: [{ id: 'userTeamId' }] }
        } as never)
        ;(prismaMock.muxVideo.create as Mock).mockResolvedValue({
          id: 'videoId'
        })

        await authClient({
          document: CREATE_BY_URL_WITH_JOURNEY,
          variables: {
            url: 'https://example.com/video.mp4',
            journeyId: 'journeyId'
          }
        })

        expect(prismaMock.muxVideo.create).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({ teamId: 'teamId' })
          })
        )
      })

      it('should not create a row when caller lacks access to the journey team', async () => {
        ;(prismaMock.userMediaRole.findUnique as Mock).mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        journeysPrismaMock.journey.findUnique.mockResolvedValue({
          teamId: 'teamId',
          team: { userTeams: [] }
        } as never)

        const result = (await authClient({
          document: CREATE_BY_URL_WITH_JOURNEY,
          variables: {
            url: 'https://example.com/video.mp4',
            journeyId: 'journeyId'
          }
        })) as {
          data: unknown
          errors?: { extensions?: { code?: string } }[]
        }

        expect(result.errors?.[0]?.extensions?.code).toBe('FORBIDDEN')
        expect(prismaMock.muxVideo.create).not.toHaveBeenCalled()
      })
    })

    describe('deleteMuxVideo', () => {
      const DELETE_MUX_VIDEO = graphql(`
        mutation DeleteMuxVideo($id: ID!, $userGenerated: Boolean) {
          deleteMuxVideo(id: $id, userGenerated: $userGenerated)
        }
      `)

      it('should return true IF publisher', async () => {
        ;(prismaMock.userMediaRole.findUnique as Mock).mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        ;(prismaMock.muxVideo.delete as Mock).mockResolvedValue({
          id: 'videoId',
          playbackId: 'playbackId',
          uploadId: 'uploadId',
          assetId: 'assetId',
          duration: 10,
          name: 'videoName',
          uploadUrl: null,
          userId: 'testUserId',
          createdAt: new Date(),
          readyToStream: true,
          downloadable: false,
          updatedAt: new Date()
        })
        const result = await authClient({
          document: DELETE_MUX_VIDEO,
          variables: {
            id: 'videoId',
            userGenerated: false
          }
        })
        expect(prismaMock.muxVideo.findUniqueOrThrow).toHaveBeenCalledWith({
          where: { id: 'videoId' }
        })
        expect(prismaMock.muxVideo.delete).toHaveBeenCalledWith({
          where: { id: 'videoId' }
        })
        expect(result).toHaveProperty('data.deleteMuxVideo', true)
      })

      it('should return true if not publisher', async () => {
        ;(prismaMock.userMediaRole.findUnique as Mock).mockResolvedValue({
          id: 'testUserId',
          userId: 'userId',
          roles: []
        })
        ;(prismaMock.muxVideo.delete as Mock).mockResolvedValue({
          id: 'videoId',
          name: 'videoName',
          uploadUrl: null,
          uploadId: 'uploadId',
          playbackId: 'playbackId',
          assetId: 'assetId',
          duration: 10,
          userId: 'testUserId',
          createdAt: new Date(),
          readyToStream: true,
          downloadable: false,
          updatedAt: new Date()
        })
        const result = await authClient({
          document: DELETE_MUX_VIDEO,
          variables: {
            id: 'videoId',
            userGenerated: true
          }
        })
        expect(prismaMock.muxVideo.findUniqueOrThrow).toHaveBeenCalledWith({
          where: { id: 'videoId', userId: 'testUserId' }
        })
        expect(prismaMock.muxVideo.delete).toHaveBeenCalledWith({
          where: { id: 'videoId' }
        })
        expect(result).toHaveProperty('data.deleteMuxVideo', true)
      })
    })

    describe('enableMuxDownload', () => {
      const ENABLE_MUX_DOWNLOAD = graphql(`
        mutation EnableMuxDownload($id: ID!, $resolution: String) {
          enableMuxDownload(id: $id, resolution: $resolution) {
            id
            downloadable
          }
        }
      `)

      it('should enable download for a video with default resolution', async () => {
        ;(prismaMock.userMediaRole.findUnique as Mock).mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        ;(prismaMock.muxVideo.findUniqueOrThrow as Mock).mockResolvedValue({
          id: 'videoId',
          playbackId: 'playbackId',
          uploadId: 'uploadId',
          assetId: 'assetId',
          duration: 10,
          name: 'videoName',
          uploadUrl: null,
          userId: 'testUserId',
          createdAt: new Date(),
          readyToStream: true,
          downloadable: false,
          updatedAt: new Date()
        })
        ;(prismaMock.muxVideo.update as Mock).mockResolvedValue({
          id: 'videoId',
          playbackId: 'playbackId',
          uploadId: 'uploadId',
          assetId: 'assetId',
          duration: 10,
          name: 'videoName',
          uploadUrl: null,
          userId: 'testUserId',
          createdAt: new Date(),
          readyToStream: true,
          downloadable: true,
          updatedAt: new Date()
        })
        const result = await publisherClient({
          document: ENABLE_MUX_DOWNLOAD,
          variables: {
            id: 'videoId'
          }
        })

        expect(enableDownload).toHaveBeenCalledWith('assetId', false, '1080p')

        // Check that the database was updated
        expect(prismaMock.muxVideo.update).toHaveBeenCalledWith({
          where: { id: 'videoId' },
          data: {
            downloadable: true
          }
        })

        // Check the response
        expect(result).toHaveProperty('data.enableMuxDownload', {
          id: 'videoId',
          downloadable: true
        })
      })

      it('should enable download for a video with custom resolution', async () => {
        ;(prismaMock.userMediaRole.findUnique as Mock).mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        ;(prismaMock.muxVideo.findUniqueOrThrow as Mock).mockResolvedValue({
          id: 'videoId',
          playbackId: 'playbackId',
          uploadId: 'uploadId',
          assetId: 'assetId',
          duration: 10,
          name: 'videoName',
          uploadUrl: null,
          userId: 'testUserId',
          createdAt: new Date(),
          readyToStream: true,
          downloadable: false,
          updatedAt: new Date()
        })
        ;(prismaMock.muxVideo.update as Mock).mockResolvedValue({
          id: 'videoId',
          playbackId: 'playbackId',
          uploadId: 'uploadId',
          assetId: 'assetId',
          duration: 10,
          name: 'videoName',
          uploadUrl: null,
          userId: 'testUserId',
          createdAt: new Date(),
          readyToStream: true,
          downloadable: true,
          updatedAt: new Date()
        })
        const result = await publisherClient({
          document: ENABLE_MUX_DOWNLOAD,
          variables: {
            id: 'videoId',
            resolution: '720p'
          }
        })

        expect(enableDownload).toHaveBeenCalledWith('assetId', false, '720p')

        // Check that the database was updated
        expect(prismaMock.muxVideo.update).toHaveBeenCalledWith({
          where: { id: 'videoId' },
          data: {
            downloadable: true
          }
        })

        // Check the response
        expect(result).toHaveProperty('data.enableMuxDownload', {
          id: 'videoId',
          downloadable: true
        })
      })

      it('should throw an error for invalid resolution', async () => {
        ;(prismaMock.userMediaRole.findUnique as Mock).mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        ;(prismaMock.muxVideo.findUniqueOrThrow as Mock).mockResolvedValue({
          id: 'videoId',
          playbackId: 'playbackId',
          uploadId: 'uploadId',
          assetId: 'assetId',
          duration: 10,
          name: 'videoName',
          uploadUrl: null,
          userId: 'testUserId',
          createdAt: new Date(),
          readyToStream: true,
          downloadable: false,
          updatedAt: new Date()
        })

        const result = (await publisherClient({
          document: ENABLE_MUX_DOWNLOAD,
          variables: {
            id: 'videoId',
            resolution: 'invalid'
          }
        })) as {
          data: any
          errors?: { message: string; extensions?: { code: string } }[]
        }

        expect(result.errors).toBeDefined()
        expect(result.errors?.[0]?.message).toBe('Invalid resolution')
        expect(result.errors?.[0]?.extensions?.code).toBe('BAD_REQUEST')
      })

      it('should fail if not authenticated', async () => {
        const result = await client({
          document: ENABLE_MUX_DOWNLOAD,
          variables: {
            id: 'videoId'
          }
        })
        expect(result).toHaveProperty('data.enableMuxDownload', null)
      })
    })
  })

  describe('entity', () => {
    const MUX_VIDEO = graphql(`
      query MuxVideo {
        _entities(
          representations: [
            { __typename: "MuxVideo", id: "testId", primaryLanguageId: null }
          ]
        ) {
          ... on MuxVideo {
            id
          }
        }
      }
    `)

    it('should return mux video', async () => {
      ;(prismaMock.muxVideo.findUniqueOrThrow as Mock).mockResolvedValue({
        id: 'testId',
        assetId: 'testAssetId',
        playbackId: 'testPlaybackId',
        uploadId: 'testUploadId',
        userId: 'testUserId',
        uploadUrl: 'testUrl',
        createdAt: new Date(),
        updatedAt: new Date(),
        name: 'testName',
        readyToStream: true,
        downloadable: false,
        duration: 10
      })
      const data = await client({
        document: MUX_VIDEO
      })
      expect(prismaMock.muxVideo.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: 'testId' }
      })
      expect(data).toHaveProperty('data._entities[0]', {
        id: 'testId'
      })
    })
  })
})
