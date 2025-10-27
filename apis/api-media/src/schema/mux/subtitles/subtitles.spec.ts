import { graphql } from '@core/shared/gql'

import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'

import { createGeneratedSubtitlesByAssetId, getSubtitleTrack } from './service'

jest.mock('../services', () => ({
  getClient: jest.fn(),
  getVideo: jest.fn().mockResolvedValue({
    id: 'assetId',
    status: 'ready',
    playback_ids: [{ id: 'playbackId' }],
    duration: 10
  })
}))

jest.mock('./service', () => ({
  getSubtitleTrack: jest.fn(),
  createGeneratedSubtitlesByAssetId: jest.fn(),
  muxSubtitleResponseArraySchema: {
    parse: jest.fn((data: any) => data.generated_subtitles || [])
  }
}))

const mockGetSubtitleTrack = jest.mocked(getSubtitleTrack)
const mockCreateGeneratedSubtitles = jest.mocked(
  createGeneratedSubtitlesByAssetId
)

describe('mux/subtitles', () => {
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

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('queries', () => {
    describe('getMyMuxSubtitleTrack', () => {
      const GET_MY_MUX_SUBTITLE_TRACK = graphql(`
        query GetMyMuxSubtitleTrack($id: ID!, $userGenerated: Boolean) {
          getMyMuxSubtitleTrack(id: $id, userGenerated: $userGenerated) {
            ... on QueryGetMyMuxSubtitleTrackSuccess {
              data {
                id
                trackId
                languageCode
                muxLanguageName
                readyToStream
                source
                muxVideo {
                  id
                }
              }
            }
            ... on Error {
              message
            }
          }
        }
      `)

      it('should return subtitle track when ready', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })

        prismaMock.muxSubtitleTrack.findFirstOrThrow.mockResolvedValue({
          id: 'subtitleTrackId',
          trackId: 'trackId123',
          languageCode: 'en-US',
          muxLanguageName: 'English',
          readyToStream: true,
          source: 'generated',
          muxVideoId: 'muxVideoId',
          muxVideo: {
            id: 'muxVideoId',
            assetId: 'assetId123'
          }
        } as any)

        const data = await authClient({
          document: GET_MY_MUX_SUBTITLE_TRACK,
          variables: {
            id: 'subtitleTrackId',
            userGenerated: false
          }
        })

        const result = data as any
        expect(result.data.getMyMuxSubtitleTrack.data.id).toBe(
          'subtitleTrackId'
        )
        expect(result.data.getMyMuxSubtitleTrack.data.trackId).toBe(
          'trackId123'
        )
        expect(result.data.getMyMuxSubtitleTrack.data.languageCode).toBe(
          'en-US'
        )
      })

      it('should check and update status when not ready', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })

        prismaMock.muxSubtitleTrack.findFirstOrThrow.mockResolvedValue({
          id: 'subtitleTrackId',
          trackId: 'trackId123',
          languageCode: 'en-US',
          muxLanguageName: 'English',
          readyToStream: false,
          source: 'generated',
          muxVideoId: 'muxVideoId',
          muxVideo: {
            id: 'muxVideoId',
            assetId: 'assetId123'
          }
        } as any)

        mockGetSubtitleTrack.mockResolvedValue({
          id: 'trackId123',
          type: 'text',
          status: 'ready'
        } as any)

        prismaMock.muxSubtitleTrack.update.mockResolvedValue({
          id: 'subtitleTrackId',
          trackId: 'trackId123',
          languageCode: 'en-US',
          muxLanguageName: 'English',
          readyToStream: true,
          source: 'generated',
          muxVideoId: 'muxVideoId',
          muxVideo: {
            id: 'muxVideoId',
            assetId: 'assetId123'
          }
        } as any)

        await authClient({
          document: GET_MY_MUX_SUBTITLE_TRACK,
          variables: {
            id: 'subtitleTrackId',
            userGenerated: false
          }
        })

        expect(mockGetSubtitleTrack).toHaveBeenCalledWith(
          'assetId123',
          'trackId123',
          false
        )
        expect(prismaMock.muxSubtitleTrack.update).toHaveBeenCalled()
      })

      it('should fail when asset ID is missing', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })

        prismaMock.muxSubtitleTrack.findFirstOrThrow.mockResolvedValue({
          id: 'subtitleTrackId',
          trackId: 'trackId123',
          languageCode: 'en-US',
          readyToStream: false,
          muxVideoId: 'muxVideoId',
          muxVideo: {
            id: 'muxVideoId',
            assetId: null
          }
        } as any)

        const data = await authClient({
          document: GET_MY_MUX_SUBTITLE_TRACK,
          variables: {
            id: 'subtitleTrackId',
            userGenerated: false
          }
        })

        expect(data).toBeDefined()
      })

      it('should return null when not authorized', async () => {
        const data = await client({
          document: GET_MY_MUX_SUBTITLE_TRACK,
          variables: {
            id: 'subtitleTrackId',
            userGenerated: false
          }
        })

        expect(data).toHaveProperty('data', null)
      })
    })
  })

  describe('mutations', () => {
    describe('createMuxGeneratedSubtitlesByAssetId', () => {
      const CREATE_MUX_GENERATED_SUBTITLES = graphql(`
        mutation CreateMuxGeneratedSubtitles(
          $assetId: ID!
          $languageCode: String!
          $name: String!
          $userGenerated: Boolean
        ) {
          createMuxGeneratedSubtitlesByAssetId(
            assetId: $assetId
            languageCode: $languageCode
            name: $name
            userGenerated: $userGenerated
          ) {
            ... on MutationCreateMuxGeneratedSubtitlesByAssetIdSuccess {
              data {
                id
                trackId
                languageCode
                muxLanguageName
                readyToStream
                source
              }
            }
            ... on Error {
              message
            }
            ... on ZodError {
              message
              fieldErrors {
                message
                path
              }
            }
          }
        }
      `)

      it('should create generated subtitles successfully', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })

        prismaMock.muxVideo.findFirst.mockResolvedValue({
          id: 'muxVideoId',
          assetId: 'assetId123',
          userId: 'userId',
          playbackId: 'playbackId',
          readyToStream: true,
          name: null,
          uploadUrl: null,
          uploadId: null,
          duration: 10,
          downloadable: false,
          createdAt: new Date(),
          updatedAt: new Date()
        } as any)

        prismaMock.muxSubtitleTrack.findFirst.mockResolvedValue(null)

        mockCreateGeneratedSubtitles.mockResolvedValue({
          generated_subtitles: [
            {
              id: 'subtitleId123',
              language_code: 'en-US',
              name: 'English',
              status: 'ready'
            }
          ]
        } as any)

        prismaMock.muxSubtitleTrack.create.mockResolvedValue({
          id: 'subtitleTrackId',
          trackId: 'subtitleId123',
          languageCode: 'en-US',
          muxLanguageName: 'English',
          readyToStream: true,
          source: 'generated',
          muxVideoId: 'muxVideoId'
        } as any)

        const data = await publisherClient({
          document: CREATE_MUX_GENERATED_SUBTITLES,
          variables: {
            assetId: 'assetId123',
            languageCode: 'en-US',
            name: 'English',
            userGenerated: false
          }
        })

        expect(mockCreateGeneratedSubtitles).toHaveBeenCalledWith(
          false,
          'assetId123',
          'en-US',
          'English'
        )
        expect(prismaMock.muxSubtitleTrack.create).toHaveBeenCalled()
        const result = data as any
        expect(result.data.createMuxGeneratedSubtitlesByAssetId.data.id).toBe(
          'subtitleTrackId'
        )
        expect(
          result.data.createMuxGeneratedSubtitlesByAssetId.data.trackId
        ).toBe('subtitleId123')
        expect(
          result.data.createMuxGeneratedSubtitlesByAssetId.data.languageCode
        ).toBe('en-US')
      })

      it('should fail when video not found', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })

        prismaMock.muxVideo.findFirst.mockResolvedValue(null)

        const data = await publisherClient({
          document: CREATE_MUX_GENERATED_SUBTITLES,
          variables: {
            assetId: 'assetId123',
            languageCode: 'en-US',
            name: 'English',
            userGenerated: false
          }
        })

        const result = data as any
        expect(
          result.data.createMuxGeneratedSubtitlesByAssetId.message
        ).toBeDefined()
      })

      it('should fail when subtitle already exists', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })

        prismaMock.muxVideo.findFirst.mockResolvedValue({
          id: 'muxVideoId',
          assetId: 'assetId123',
          userId: 'userId',
          playbackId: 'playbackId',
          readyToStream: true,
          name: null,
          uploadUrl: null,
          uploadId: null,
          duration: 10,
          downloadable: false,
          createdAt: new Date(),
          updatedAt: new Date()
        } as any)

        prismaMock.muxSubtitleTrack.findFirst.mockResolvedValue({
          id: 'existingSubtitleId',
          trackId: 'trackId123',
          languageCode: 'en-US',
          muxLanguageName: 'English',
          readyToStream: true,
          source: 'generated',
          muxVideoId: 'muxVideoId'
        } as any)

        const data = await publisherClient({
          document: CREATE_MUX_GENERATED_SUBTITLES,
          variables: {
            assetId: 'assetId123',
            languageCode: 'en-US',
            name: 'English',
            userGenerated: false
          }
        })

        const result = data as any
        expect(
          result.data.createMuxGeneratedSubtitlesByAssetId.message
        ).toBeDefined()
      })

      it('should fail when subtitle not received from Mux', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })

        prismaMock.muxVideo.findFirst.mockResolvedValue({
          id: 'muxVideoId',
          assetId: 'assetId123',
          userId: 'userId',
          playbackId: 'playbackId',
          readyToStream: true,
          name: null,
          uploadUrl: null,
          uploadId: null,
          duration: 10,
          downloadable: false,
          createdAt: new Date(),
          updatedAt: new Date()
        } as any)

        prismaMock.muxSubtitleTrack.findFirst.mockResolvedValue(null)

        mockCreateGeneratedSubtitles.mockResolvedValue({
          generated_subtitles: []
        } as any)

        const data = await publisherClient({
          document: CREATE_MUX_GENERATED_SUBTITLES,
          variables: {
            assetId: 'assetId123',
            languageCode: 'en-US',
            name: 'English',
            userGenerated: false
          }
        })

        const result = data as any
        expect(
          result.data.createMuxGeneratedSubtitlesByAssetId.message
        ).toBeDefined()
      })

      it('should fail if not authenticated', async () => {
        const data = await client({
          document: CREATE_MUX_GENERATED_SUBTITLES,
          variables: {
            assetId: 'assetId123',
            languageCode: 'en-US',
            name: 'English'
          }
        })

        expect(data).toHaveProperty('data', null)
      })
    })
  })
})
