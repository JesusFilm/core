import { MockedProvider } from '@apollo/client/testing'
import { act, renderHook, waitFor } from '@testing-library/react'
import axios from 'axios'
import { SnackbarProvider, useSnackbar } from 'notistack'
import { ReactNode } from 'react'
import { type Mock } from 'vitest'

import { refreshToken } from '../api'

import {
  COMPLETE_R2_MULTIPART,
  CREATE_MUX_VIDEO_UPLOAD_BY_URL,
  CREATE_VIDEO_VARIANT,
  GET_MY_MUX_VIDEO,
  PREPARE_R2_MULTIPART,
  UploadVideoVariantProvider,
  useUploadVideoVariant
} from './UploadVideoVariantProvider'

// Mock axios
vi.mock('axios', () => ({
  default: {
    put: vi.fn().mockResolvedValue({
      headers: {
        etag: '"etag-1"'
      }
    })
  }
}))

// Mock useSnackbar
vi.mock('notistack', async () => ({
  ...(await vi.importActual('notistack')),
  useSnackbar: vi.fn()
}))

vi.mock('uuid', () => ({
  v4: vi.fn().mockReturnValue('uuidv4')
}))

vi.mock('../api', () => ({
  refreshToken: vi.fn().mockResolvedValue('refreshed-token')
}))

// Mock the getExtension function
vi.mock(
  '../(dashboard)/videos/[videoId]/audio/add/_utils/getExtension',
  () => ({
    getExtension: vi.fn().mockReturnValue('.mp4')
  })
)

// Define GraphQL operation mocks
const mockFileName = `video-id/variants/language-id/videos/uuidv4/language-id_video-id.mp4`

const prepareR2MultipartMock = {
  request: {
    query: PREPARE_R2_MULTIPART,
    variables: {
      input: {
        fileName: mockFileName,
        contentType: 'video/mp4',
        contentLength: 4, // File(['test']) has length 4
        originalFilename: 'test.mp4',
        videoId: 'video-id'
      }
    }
  },
  result: vi.fn(() => ({
    data: {
      cloudflareR2MultipartPrepare: {
        id: 'r2-asset.id',
        uploadId: 'upload-id',
        fileName: mockFileName,
        publicUrl: `https://mock.cloudflare-domain.com/${mockFileName}`,
        partSize: 5 * 1024 * 1024,
        parts: [
          {
            partNumber: 1,
            uploadUrl: 'https://mock-upload-part-url'
          }
        ]
      }
    }
  }))
}

const completeR2MultipartMock = {
  request: {
    query: COMPLETE_R2_MULTIPART,
    variables: {
      input: {
        id: 'r2-asset.id',
        fileName: mockFileName,
        uploadId: 'upload-id',
        parts: [{ partNumber: 1, eTag: 'etag-1' }]
      }
    }
  },
  result: {
    data: {
      cloudflareR2CompleteMultipart: {
        id: 'r2-asset.id',
        fileName: mockFileName,
        publicUrl: `https://mock.cloudflare-domain.com/${mockFileName}`
      }
    }
  }
}

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
const prepareR2MultipartErrorMock = {
  request: prepareR2MultipartMock.request,
  result: {
    data: {
      cloudflareR2MultipartPrepare: {
        id: 'r2-id',
        uploadId: null,
        fileName: mockFileName,
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
  uploadedBytes: 0,
  totalBytes: 0,
  uploadSpeedBps: null,
  etaSeconds: null,
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

const mockEnqueueSnackbar = vi.fn()

const createWrapper = (mocks: any[] = []) => {
  return ({ children }: { children: ReactNode }) => {
    // Setup mock for useSnackbar
    ;(useSnackbar as Mock).mockReturnValue({
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
    vi.clearAllMocks()
    ;(refreshToken as Mock).mockResolvedValue('refreshed-token')
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

      // Provide multiple mocks for the polling query since it polls multiple times
      const mocks = [
        prepareR2MultipartMock,
        completeR2MultipartMock,
        createMuxVideoUploadByUrlMock,
        getMyMuxVideoMock,
        // Provide another mock for the polling query in case it's called again
        {
          ...getMyMuxVideoMock,
          request: {
            ...getMyMuxVideoMock.request
          }
        },
        createVideoVariantMock
      ]

      const { result } = renderHook(() => useUploadVideoVariant(), {
        wrapper: createWrapper(mocks)
      })

      // Kick off the upload. START_UPLOAD dispatches synchronously before the
      // first await, so the metadata is observable mid-flight — before the
      // pipeline reaches COMPLETE and resets state back to initial.
      let resolveUpload: (value: { headers: { etag: string } }) => void
      const uploadDeferred = new Promise<{ headers: { etag: string } }>(
        (resolve) => {
          resolveUpload = resolve
        }
      )
      ;(axios.put as Mock).mockImplementationOnce(() => uploadDeferred)

      let uploadPromise: Promise<void> = Promise.resolve()
      act(() => {
        uploadPromise = result.current.startUpload(
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
        expect(result.current.uploadState.videoId).toBe('video-id')
      })
      expect(result.current.uploadState.languageId).toBe('language-id')
      expect(result.current.uploadState.languageSlug).toBe('en')
      expect(result.current.uploadState.edition).toBe('base')

      // Let the upload pipeline run to completion
      await act(async () => {
        resolveUpload({ headers: { etag: '"etag-1"' } })
        await uploadPromise
      })

      // Should call axios.put for file upload
      await waitFor(() => {
        expect(axios.put).toHaveBeenCalledWith(
          'https://mock-upload-part-url',
          expect.any(Blob),
          expect.objectContaining({
            headers: { 'Content-Type': 'video/mp4' },
            onUploadProgress: expect.any(Function),
            signal: expect.anything()
          })
        )
      })

      // Should reset state after successful completion
      await waitFor(
        () => {
          expect(result.current.uploadState).toEqual(initialStateForTests)
        },
        { timeout: 10000 }
      )

      // Should show success snackbar
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith('Audio Language Added', {
        variant: 'success'
      })
    }, 15000)

    it('should handle R2 multipart creation error', async () => {
      const file = new File(['test'], 'test.mp4', { type: 'video/mp4' })

      const { result } = renderHook(() => useUploadVideoVariant(), {
        wrapper: createWrapper([prepareR2MultipartErrorMock])
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
          'Failed to prepare R2 multipart upload'
        )
        expect(result.current.uploadState.isUploading).toBe(false)
        expect(result.current.uploadState.isProcessing).toBe(false)
      })

      // Should show error snackbar
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        'Failed to prepare R2 multipart upload',
        {
          variant: 'error'
        }
      )
    })

    it('should handle Mux video creation error', async () => {
      const file = new File(['test'], 'test.mp4', { type: 'video/mp4' })

      const mocks = [
        prepareR2MultipartMock,
        completeR2MultipartMock,
        createMuxVideoUploadByUrlErrorMock
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

      // Should call R2 creation
      await waitFor(() => {
        expect(prepareR2MultipartMock.result).toHaveBeenCalled()
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
        wrapper: createWrapper([prepareR2MultipartErrorMock])
      })

      // Start upload with error mock to set error state
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

      // Wait for error state to be set
      await waitFor(() => {
        expect(result.current.uploadState.error).toBe(
          'Failed to prepare R2 multipart upload'
        )
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
        prepareR2MultipartMock,
        completeR2MultipartMock,
        createMuxVideoUploadByUrlMock,
        getMyMuxVideoMock,
        {
          ...getMyMuxVideoMock,
          request: {
            ...getMyMuxVideoMock.request
          }
        },
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
        expect(prepareR2MultipartMock.result).toHaveBeenCalled()
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
        prepareR2MultipartMock,
        completeR2MultipartMock,
        createMuxVideoUploadByUrlMock,
        getMyMuxVideoMock,
        {
          ...getMyMuxVideoMock,
          request: {
            ...getMyMuxVideoMock.request
          }
        },
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
        prepareR2MultipartMock,
        completeR2MultipartMock,
        createMuxVideoUploadByUrlMock,
        getMyMuxVideoMock,
        {
          ...getMyMuxVideoMock,
          request: {
            ...getMyMuxVideoMock.request
          }
        },
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
        expect(prepareR2MultipartMock.result).toHaveBeenCalled()
      })

      // Should set error state
      await waitFor(() => {
        expect(result.current.uploadState.error).toBe(
          'Failed to create video variant: Variant creation failed'
        )
        expect(result.current.uploadState.isUploading).toBe(false)
        expect(result.current.uploadState.isProcessing).toBe(false)
      })

      // Should show error snackbar
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        'Failed to create video variant: Variant creation failed',
        {
          variant: 'error'
        }
      )
    })
  })
})
