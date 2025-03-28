import { MockedProvider } from '@apollo/client/testing'
import { act, renderHook, waitFor } from '@testing-library/react'
import axios from 'axios'
import { NextIntlClientProvider } from 'next-intl'
import { SnackbarProvider, useSnackbar } from 'notistack'
import { ReactNode } from 'react'

import {
  CLOUDFLARE_R2_CREATE,
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

// Define GraphQL operation mocks
const cloudflareR2CreateMock = {
  request: {
    query: CLOUDFLARE_R2_CREATE,
    variables: {
      input: {
        fileName: `video-id/variants/language-id/videos/uuidv4/language-id_video-id.mp4`,
        originalFilename: 'test.mp4',
        contentType: 'video/mp4',
        contentLength: 4,
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
        uploadUrl: 'https://upload-url.com',
        publicUrl: 'https://public-url.com'
      }
    }
  }
}

const createMuxVideoUploadByUrlMock = {
  request: {
    query: CREATE_MUX_VIDEO_UPLOAD_BY_URL,
    variables: {
      url: 'https://public-url.com'
    }
  },
  result: {
    data: {
      createMuxVideoUploadByUrl: {
        id: 'mux-id',
        assetId: 'asset-id',
        playbackId: 'playback-id',
        readyToStream: false
      }
    }
  }
}

const getMyMuxVideoMock = {
  request: {
    query: GET_MY_MUX_VIDEO,
    variables: {
      id: 'mux-id'
    }
  },
  result: {
    data: {
      getMyMuxVideo: {
        id: 'mux-id',
        assetId: 'asset-id',
        playbackId: 'playback-id',
        readyToStream: true
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
        slug: 'video-id/en',
        downloadable: true,
        published: true,
        muxVideoId: 'mux-id',
        hls: 'https://stream.mux.com/playback-id.m3u8'
      }
    }
  },
  result: {
    data: {
      videoVariantCreate: {
        id: 'language-id_video-id',
        videoId: 'video-id',
        slug: 'video-id/en',
        hls: 'https://stream.mux.com/playback-id.m3u8',
        language: {
          id: 'language-id',
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
const cloudflareR2CreateErrorMock = {
  request: {
    query: CLOUDFLARE_R2_CREATE,
    variables: {
      input: {
        fileName: `video-id/variants/language-id/videos/uuidv4/language-id_video-id.mp4`,
        originalFilename: 'test.mp4',
        contentType: 'video/mp4',
        contentLength: 4,
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
      url: 'https://public-url.com'
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
        slug: 'video-id/en',
        downloadable: true,
        published: true,
        muxVideoId: 'mux-id',
        hls: 'https://stream.mux.com/playback-id.m3u8'
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
  videoId: null
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
          <NextIntlClientProvider locale="en" messages={{}}>
            <UploadVideoVariantProvider>{children}</UploadVideoVariantProvider>
          </NextIntlClientProvider>
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

      // Create result functions to track when mocks are called
      const r2CreateResult = jest
        .fn()
        .mockReturnValue(cloudflareR2CreateMock.result)
      const muxCreateResult = jest
        .fn()
        .mockReturnValue(createMuxVideoUploadByUrlMock.result)
      const getMuxVideoResult = jest
        .fn()
        .mockReturnValue(getMyMuxVideoMock.result)
      const createVariantResult = jest
        .fn()
        .mockReturnValue(createVideoVariantMock.result)

      const mocks = [
        { ...cloudflareR2CreateMock, result: r2CreateResult },
        { ...createMuxVideoUploadByUrlMock, result: muxCreateResult },
        { ...getMyMuxVideoMock, result: getMuxVideoResult },
        { ...createVideoVariantMock, result: createVariantResult }
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
          'base'
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
        expect(r2CreateResult).toHaveBeenCalled()
      })

      // Should call axios.put for file upload
      expect(axios.put).toHaveBeenCalledWith(
        'https://upload-url.com',
        file,
        expect.objectContaining({
          headers: { 'Content-Type': 'video/mp4' },
          onUploadProgress: expect.any(Function)
        })
      )

      // Should call Mux video creation
      await waitFor(() => {
        expect(muxCreateResult).toHaveBeenCalled()
      })

      // Should transition to processing state
      await waitFor(() => {
        expect(result.current.uploadState.isProcessing).toBe(true)
        expect(result.current.uploadState.isUploading).toBe(false)
        expect(result.current.uploadState.muxVideoId).toBe('mux-id')
      })

      // Should call getMuxVideo for polling
      await waitFor(() => {
        expect(getMuxVideoResult).toHaveBeenCalled()
      })

      // Should call createVideoVariant when Mux processing completes
      await waitFor(() => {
        expect(createVariantResult).toHaveBeenCalled()
      })

      // Should reset state after successful completion
      await waitFor(() => {
        expect(result.current.uploadState).toEqual(initialStateForTests)
      })

      // Should show success snackbar
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith('Audio Language Added', {
        variant: 'success'
      })
    })

    it('should handle R2 asset creation error', async () => {
      const file = new File(['test'], 'test.mp4', { type: 'video/mp4' })

      const { result } = renderHook(() => useUploadVideoVariant(), {
        wrapper: createWrapper([cloudflareR2CreateErrorMock])
      })

      await act(async () => {
        await result.current.startUpload(
          file,
          'video-id',
          'language-id',
          'en',
          'base'
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

      const r2CreateResult = jest
        .fn()
        .mockReturnValue(cloudflareR2CreateMock.result)

      const mocks = [
        { ...cloudflareR2CreateMock, result: r2CreateResult },
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
          'base'
        )
      })

      // Should call R2 creation
      await waitFor(() => {
        expect(r2CreateResult).toHaveBeenCalled()
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
          'base'
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
          uploadProgress: 0,
          videoId: null
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

      // Create result functions to track when mocks are called
      const r2CreateResult = jest
        .fn()
        .mockReturnValue(cloudflareR2CreateMock.result)
      const muxCreateResult = jest
        .fn()
        .mockReturnValue(createMuxVideoUploadByUrlMock.result)
      const getMuxVideoResult = jest
        .fn()
        .mockReturnValue(getMyMuxVideoMock.result)
      const createVariantResult = jest
        .fn()
        .mockReturnValue(createVideoVariantMock.result)

      const mocks = [
        { ...cloudflareR2CreateMock, result: r2CreateResult },
        { ...createMuxVideoUploadByUrlMock, result: muxCreateResult },
        { ...getMyMuxVideoMock, result: getMuxVideoResult },
        { ...createVideoVariantMock, result: createVariantResult }
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
          'base'
        )
      })

      // Verify the state is correctly set with languageSlug
      expect(result.current.uploadState.languageSlug).toBe('en')

      // Should call all the mutations in sequence
      await waitFor(() => {
        expect(r2CreateResult).toHaveBeenCalled()
      })

      await waitFor(() => {
        expect(muxCreateResult).toHaveBeenCalled()
      })

      await waitFor(() => {
        expect(getMuxVideoResult).toHaveBeenCalled()
      })

      await waitFor(() => {
        expect(createVariantResult).toHaveBeenCalled()
      })

      // Should show success snackbar
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith('Audio Language Added', {
        variant: 'success'
      })

      // Should reset state
      await waitFor(() => {
        expect(result.current.uploadState).toEqual(initialStateForTests)
      })
    })

    it('handles variant creation error', async () => {
      const file = new File(['test'], 'test.mp4', { type: 'video/mp4' })

      // Create result functions to track when mocks are called
      const r2CreateResult = jest
        .fn()
        .mockReturnValue(cloudflareR2CreateMock.result)
      const muxCreateResult = jest
        .fn()
        .mockReturnValue(createMuxVideoUploadByUrlMock.result)
      const getMuxVideoResult = jest
        .fn()
        .mockReturnValue(getMyMuxVideoMock.result)

      const mocks = [
        { ...cloudflareR2CreateMock, result: r2CreateResult },
        { ...createMuxVideoUploadByUrlMock, result: muxCreateResult },
        { ...getMyMuxVideoMock, result: getMuxVideoResult },
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
          'base'
        )
      })

      // Should call all the mutations in sequence
      await waitFor(() => {
        expect(r2CreateResult).toHaveBeenCalled()
      })

      await waitFor(() => {
        expect(muxCreateResult).toHaveBeenCalled()
      })

      await waitFor(() => {
        expect(getMuxVideoResult).toHaveBeenCalled()
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
