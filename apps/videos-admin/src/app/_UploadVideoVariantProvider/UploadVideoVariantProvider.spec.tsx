import { MockedProvider } from '@apollo/client/testing'
import { act, renderHook, waitFor } from '@testing-library/react'
import axios from 'axios'
import { SnackbarProvider, useSnackbar } from 'notistack'
import { ReactNode } from 'react'

import { getCreateR2AssetMock } from '../../libs/useCreateR2Asset/useCreateR2Asset.mock'

import {
  CREATE_MUX_VIDEO_UPLOAD_BY_URL,
  CREATE_VIDEO_VARIANT,
  GET_MY_MUX_VIDEO,
  UploadVideoVariantProvider,
  useUploadVideoVariant
} from './UploadVideoVariantProvider'

// Mock axios
jest.mock('axios', () => ({
  put: jest.fn().mockResolvedValue({})
}))

// Mock useSnackbar
jest.mock('notistack', () => ({
  ...jest.requireActual('notistack'),
  useSnackbar: jest.fn()
}))

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('uuidv4')
}))

// Mock the getExtension function
jest.mock(
  '../(dashboard)/videos/[videoId]/audio/add/_utils/getExtension',
  () => ({
    getExtension: jest.fn().mockReturnValue('.mp4')
  })
)

// Define GraphQL operation mocks
const createR2AssetMock = getCreateR2AssetMock({
  fileName: `video-id/variants/language-id/videos/uuidv4/language-id_video-id.mp4`,
  contentType: 'video/mp4',
  contentLength: '4', // File(['test']) has length 4
  originalFilename: 'test.mp4',
  videoId: 'video-id'
})

const createMuxVideoUploadByUrlMock = {
  request: {
    query: CREATE_MUX_VIDEO_UPLOAD_BY_URL,
    variables: {
      url: 'https://mock.cloudflare-domain.com/video-id/variants/language-id/videos/uuidv4/language-id_video-id.mp4',
      userGenerated: false,
      downloadable: true,
      maxResolution: 'uhd'
    }
  },
  result: {
    data: {
      createMuxVideoUploadByUrl: {
        id: 'mux-id',
        assetId: 'asset-id',
        playbackId: 'playback-id',
        uploadUrl: 'upload-url',
        readyToStream: false
      }
    }
  }
}

const getMyMuxVideoMock = {
  request: {
    query: GET_MY_MUX_VIDEO,
    variables: {
      id: 'mux-id',
      userGenerated: false
    }
  },
  result: {
    data: {
      getMyMuxVideo: {
        id: 'mux-id',
        assetId: 'asset-id',
        playbackId: 'playback-id',
        readyToStream: true,
        duration: 120
      }
    }
  }
}

const createVideoVariantMock = {
  request: {
    query: CREATE_VIDEO_VARIANT,
    variables: {
      input: {
        id: 'language-id_video-id',
        videoId: 'video-id',
        edition: 'base',
        languageId: 'language-id',
        slug: 'video-slug/en',
        downloadable: true,
        published: false,
        muxVideoId: 'mux-id',
        hls: 'https://stream.mux.com/playback-id.m3u8',
        duration: 120,
        lengthInMilliseconds: 120000
      }
    }
  },
  result: {
    data: {
      videoVariantCreate: {
        id: 'language-id_video-id',
        videoId: 'video-id',
        slug: 'video-slug/en',
        hls: 'https://stream.mux.com/playback-id.m3u8',
        published: false,
        language: {
          id: 'language-id',
          slug: 'en',
          name: {
            value: 'English',
            primary: true
          }
        }
      }
    }
  }
}

// Error mocks
const createR2AssetErrorMock = {
  request: {
    query: getCreateR2AssetMock({
      fileName: `video-id/variants/language-id/videos/uuidv4/language-id_video-id.mp4`,
      contentType: 'video/mp4',
      contentLength: '4',
      originalFilename: 'test.mp4',
      videoId: 'video-id'
    }).request.query,
    variables: {
      input: {
        fileName: `video-id/variants/language-id/videos/uuidv4/language-id_video-id.mp4`,
        contentType: 'video/mp4',
        contentLength: '4',
        originalFilename: 'test.mp4',
        videoId: 'video-id'
      }
    }
  },
  result: {
    data: {
      cloudflareR2Create: {
        id: 'r2-id',
        fileName: 'test.mp4',
        originalFilename: 'test.mp4',
        uploadUrl: null,
        publicUrl: null
      }
    }
  }
}

const createMuxVideoUploadByUrlErrorMock = {
  request: {
    query: CREATE_MUX_VIDEO_UPLOAD_BY_URL,
    variables: {
      url: 'https://mock.cloudflare-domain.com/video-id/variants/language-id/videos/uuidv4/language-id_video-id.mp4',
      userGenerated: false,
      downloadable: true,
      maxResolution: 'uhd'
    }
  },
  error: new Error('Mux creation failed')
}

const createVideoVariantErrorMock = {
  request: {
    query: CREATE_VIDEO_VARIANT,
    variables: {
      input: {
        id: 'language-id_video-id',
        videoId: 'video-id',
        edition: 'base',
        languageId: 'language-id',
        slug: 'video-slug/en',
        downloadable: true,
        published: false,
        muxVideoId: 'mux-id',
        hls: 'https://stream.mux.com/playback-id.m3u8',
        duration: 120,
        lengthInMilliseconds: 120000
      }
    }
  },
  error: new Error('Variant creation failed')
}

// Initial state for comparison in tests
const initialStateForTests = {
  isUploading: false,
  uploadProgress: 0,
  isProcessing: false,
  error: null,
  muxVideoId: null,
  edition: null,
  languageId: null,
  languageSlug: null,
  videoId: null,
  published: null,
  onComplete: undefined,
  videoSlug: null
}

const mockEnqueueSnackbar = jest.fn()

const createWrapper = (mocks: any[] = []) => {
  return ({ children }: { children: ReactNode }) => {
    // Setup mock for useSnackbar
    ;(useSnackbar as jest.Mock).mockReturnValue({
      enqueueSnackbar: mockEnqueueSnackbar
    })

    return (
      <MockedProvider mocks={mocks}>
        <SnackbarProvider>
          <UploadVideoVariantProvider>{children}</UploadVideoVariantProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
  }
}

describe('UploadVideoVariantContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useUploadVideoVariant(), {
      wrapper: createWrapper()
    })

    expect(result.current.uploadState).toEqual(initialStateForTests)
  })

  describe('upload process', () => {
    it('should update state during upload process', async () => {
      const file = new File(['test'], 'test.mp4', { type: 'video/mp4' })

      const mocks = [
        createR2AssetMock,
        createMuxVideoUploadByUrlMock,
        getMyMuxVideoMock,
        createVideoVariantMock
      ]

      const { result } = renderHook(() => useUploadVideoVariant(), {
        wrapper: createWrapper(mocks)
      })

      act(() => {
        void result.current.startUpload(
          file,
          'video-id',
          'language-id',
          'en',
          'base',
          false,
          'video-slug',
          undefined
        )
      })

      // Should be in uploading state with correct metadata
      await waitFor(() => {
        expect(result.current.uploadState.isUploading).toBe(true)
        expect(result.current.uploadState.videoId).toBe('video-id')
        expect(result.current.uploadState.languageId).toBe('language-id')
        expect(result.current.uploadState.languageSlug).toBe('en')
        expect(result.current.uploadState.edition).toBe('base')
      })

      // Should call R2 creation
      await waitFor(() => {
        expect(createR2AssetMock.result).toHaveBeenCalled()
      })

      // Should call axios.put for file upload
      expect(axios.put).toHaveBeenCalledWith(
        'https://mock.cloudflare-domain.com/video-id/variants/language-id/videos/uuidv4/language-id_video-id.mp4',
        file,
        expect.objectContaining({
          headers: { 'Content-Type': 'video/mp4' },
          onUploadProgress: expect.any(Function)
        })
      )

      // Should reset state after successful completion
      await waitFor(
        () => {
          expect(result.current.uploadState).toEqual(initialStateForTests)
        },
        { timeout: 5000 }
      )

      // Should show success snackbar
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith('Audio Language Added', {
        variant: 'success'
      })
    })

    it('should handle R2 asset creation error', async () => {
      const file = new File(['test'], 'test.mp4', { type: 'video/mp4' })

      const { result } = renderHook(() => useUploadVideoVariant(), {
        wrapper: createWrapper([createR2AssetErrorMock])
      })

      await act(async () => {
        await result.current.startUpload(
          file,
          'video-id',
          'language-id',
          'en',
          'base',
          false,
          'video-slug',
          undefined
        )
      })

      // Should set error state
      await waitFor(() => {
        expect(result.current.uploadState.error).toBe(
          'Failed to create R2 asset'
        )
        expect(result.current.uploadState.isUploading).toBe(false)
        expect(result.current.uploadState.isProcessing).toBe(false)
      })

      // Should show error snackbar
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        'Failed to create R2 asset',
        {
          variant: 'error'
        }
      )
    })

    it('should handle Mux video creation error', async () => {
      const file = new File(['test'], 'test.mp4', { type: 'video/mp4' })

      const mocks = [createR2AssetMock, createMuxVideoUploadByUrlErrorMock]

      const { result } = renderHook(() => useUploadVideoVariant(), {
        wrapper: createWrapper(mocks)
      })

      await act(async () => {
        await result.current.startUpload(
          file,
          'video-id',
          'language-id',
          'en',
          'base',
          false,
          'video-slug',
          undefined
        )
      })

      // Should call R2 creation
      await waitFor(() => {
        expect(createR2AssetMock.result).toHaveBeenCalled()
      })

      // Should set error state
      await waitFor(() => {
        expect(result.current.uploadState.error).toBe('Mux creation failed')
        expect(result.current.uploadState.isUploading).toBe(false)
        expect(result.current.uploadState.isProcessing).toBe(false)
      })

      // Should show error snackbar
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith('Mux creation failed', {
        variant: 'error'
      })
    })
  })

  describe('clearUploadState', () => {
    it('resets state when called', async () => {
      const file = new File(['test'], 'test.mp4', { type: 'video/mp4' })
      const { result } = renderHook(() => useUploadVideoVariant(), {
        wrapper: createWrapper([])
      })

      // Manually set some state first
      await act(async () => {
        await result.current.startUpload(
          file,
          'video-id',
          'language-id',
          'en',
          'base',
          false,
          'video-slug',
          undefined
        )
      })

      await waitFor(() => {
        expect(result.current.uploadState).toEqual({
          edition: null,
          error: expect.any(String),
          isProcessing: false,
          isUploading: false,
          languageId: null,
          languageSlug: null,
          muxVideoId: null,
          onComplete: undefined,
          published: null,
          uploadProgress: 0,
          videoId: null,
          videoSlug: null
        })
      })

      // Clear the state
      await act(async () => {
        result.current.clearUploadState()
      })

      await waitFor(() => {
        // Should reset to initial state
        expect(result.current.uploadState).toEqual(initialStateForTests)
      })
    })
  })

  describe('variant creation', () => {
    it('creates variant and updates cache when Mux processing completes', async () => {
      const file = new File(['test'], 'test.mp4', { type: 'video/mp4' })

      const mocks = [
        createR2AssetMock,
        createMuxVideoUploadByUrlMock,
        getMyMuxVideoMock,
        createVideoVariantMock
      ]

      const { result } = renderHook(() => useUploadVideoVariant(), {
        wrapper: createWrapper(mocks)
      })

      await act(async () => {
        await result.current.startUpload(
          file,
          'video-id',
          'language-id',
          'en',
          'base',
          false,
          'video-slug',
          undefined
        )
      })

      // Should call all the mutations in sequence
      await waitFor(() => {
        expect(createR2AssetMock.result).toHaveBeenCalled()
      })

      // Should reset state and show success snackbar
      await waitFor(
        () => {
          expect(result.current.uploadState).toEqual(initialStateForTests)
          expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
            'Audio Language Added',
            {
              variant: 'success'
            }
          )
        },
        { timeout: 5000 }
      )
    })

    it('creates published variant when published is true', async () => {
      const file = new File(['test'], 'test.mp4', { type: 'video/mp4' })

      // Create a mock for published variant
      const createPublishedVariantMock = {
        request: {
          query: CREATE_VIDEO_VARIANT,
          variables: {
            input: {
              id: 'language-id_video-id',
              videoId: 'video-id',
              edition: 'base',
              languageId: 'language-id',
              slug: 'video-slug/en',
              downloadable: true,
              published: true,
              muxVideoId: 'mux-id',
              hls: 'https://stream.mux.com/playback-id.m3u8',
              duration: 120,
              lengthInMilliseconds: 120000
            }
          }
        },
        result: {
          data: {
            videoVariantCreate: {
              id: 'language-id_video-id',
              videoId: 'video-id',
              slug: 'video-slug/en',
              hls: 'https://stream.mux.com/playback-id.m3u8',
              published: true,
              language: {
                id: 'language-id',
                slug: 'en',
                name: {
                  value: 'English',
                  primary: true
                }
              }
            }
          }
        }
      }

      const mocks = [
        createR2AssetMock,
        createMuxVideoUploadByUrlMock,
        getMyMuxVideoMock,
        createPublishedVariantMock
      ]

      const { result } = renderHook(() => useUploadVideoVariant(), {
        wrapper: createWrapper(mocks)
      })

      await act(async () => {
        await result.current.startUpload(
          file,
          'video-id',
          'language-id',
          'en',
          'base',
          true, // published = true
          'video-slug'
        )
      })

      // Should reset state and show success snackbar
      await waitFor(
        () => {
          expect(result.current.uploadState).toEqual(initialStateForTests)
          expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
            'Audio Language Added',
            {
              variant: 'success'
            }
          )
        },
        { timeout: 5000 }
      )
    })

    it('handles variant creation error', async () => {
      const file = new File(['test'], 'test.mp4', { type: 'video/mp4' })

      const mocks = [
        createR2AssetMock,
        createMuxVideoUploadByUrlMock,
        getMyMuxVideoMock,
        createVideoVariantErrorMock
      ]

      const { result } = renderHook(() => useUploadVideoVariant(), {
        wrapper: createWrapper(mocks)
      })

      await act(async () => {
        await result.current.startUpload(
          file,
          'video-id',
          'language-id',
          'en',
          'base',
          false,
          'video-slug'
        )
      })

      // Should call all the mutations in sequence
      await waitFor(() => {
        expect(createR2AssetMock.result).toHaveBeenCalled()
      })

      // Should set error state
      await waitFor(() => {
        expect(result.current.uploadState.error).toBe('Variant creation failed')
        expect(result.current.uploadState.isUploading).toBe(false)
        expect(result.current.uploadState.isProcessing).toBe(false)
      })

      // Should show error snackbar
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        'Variant creation failed',
        {
          variant: 'error'
        }
      )
    })
  })
})
