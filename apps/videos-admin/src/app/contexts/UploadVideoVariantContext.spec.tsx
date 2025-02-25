import { MockedProvider } from '@apollo/client/testing'
import { act, renderHook, waitFor } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import { SnackbarProvider } from 'notistack'
import { ReactNode } from 'react'

import {
  UploadVideoVariantProvider,
  useUploadVideoVariant
} from './UploadVideoVariantContext'

// Mock axios
jest.mock('axios', () => ({
  put: jest.fn().mockResolvedValue({})
}))

// Mock GraphQL mutations
const mockCreateR2Asset = jest.fn()
const mockCreateMuxVideo = jest.fn()
const mockCreateVideoVariant = jest.fn()
const mockGetMyMuxVideo = jest.fn()

jest.mock('@apollo/client', () => {
  const originalModule = jest.requireActual('@apollo/client')
  return {
    ...originalModule,
    useMutation: jest.fn((mutation) => {
      if (mutation.includes('CloudflareR2Create')) {
        return [mockCreateR2Asset]
      }
      if (mutation.includes('CreateMuxVideoUploadByUrl')) {
        return [mockCreateMuxVideo]
      }
      if (mutation.includes('CreateVideoVariant')) {
        return [mockCreateVideoVariant]
      }
      return [jest.fn()]
    }),
    useLazyQuery: jest.fn(() => {
      return [mockGetMyMuxVideo, { stopPolling: jest.fn() }]
    })
  }
})

const wrapper = ({ children }: { children: ReactNode }) => (
  <MockedProvider>
    <SnackbarProvider>
      <NextIntlClientProvider locale="en" messages={{}}>
        <UploadVideoVariantProvider>{children}</UploadVideoVariantProvider>
      </NextIntlClientProvider>
    </SnackbarProvider>
  </MockedProvider>
)

describe('UploadVideoVariantContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useUploadVideoVariant(), { wrapper })

    expect(result.current.uploadState).toEqual({
      isUploading: false,
      uploadProgress: 0,
      isProcessing: false,
      error: null,
      muxVideoId: null
    })
  })

  it('should update state during upload process', async () => {
    const file = new File(['test'], 'test.mp4', { type: 'video/mp4' })

    // Mock successful R2 asset creation
    mockCreateR2Asset.mockResolvedValueOnce({
      data: {
        cloudflareR2Create: {
          id: 'r2-id',
          fileName: 'test.mp4',
          uploadUrl: 'https://upload-url.com',
          publicUrl: 'https://public-url.com'
        }
      }
    })

    // Mock successful Mux video creation
    mockCreateMuxVideo.mockResolvedValueOnce({
      data: {
        createMuxVideoUploadByUrl: {
          id: 'mux-id',
          assetId: 'asset-id',
          playbackId: 'playback-id',
          readyToStream: false
        }
      }
    })

    const { result } = renderHook(() => useUploadVideoVariant(), { wrapper })

    await act(async () => {
      await result.current.startUpload(
        file,
        'video-id',
        'language-id',
        'Standard'
      )
    })

    // Should be in uploading state
    expect(result.current.uploadState.isUploading).toBe(true)

    // Should call createR2Asset with correct parameters
    expect(mockCreateR2Asset).toHaveBeenCalledWith({
      variables: {
        input: expect.objectContaining({
          contentType: 'video/mp4',
          videoId: 'video-id'
        })
      }
    })

    // Should call createMuxVideo with correct URL
    await waitFor(() => {
      expect(mockCreateMuxVideo).toHaveBeenCalledWith({
        variables: {
          url: 'https://public-url.com'
        }
      })
    })

    // Should transition to processing state
    await waitFor(() => {
      expect(result.current.uploadState.isProcessing).toBe(true)
      expect(result.current.uploadState.isUploading).toBe(false)
    })

    // Should start polling for Mux video status
    expect(mockGetMyMuxVideo).toHaveBeenCalledWith({
      variables: { id: 'mux-id' }
    })
  })

  it('should handle errors during upload', async () => {
    const file = new File(['test'], 'test.mp4', { type: 'video/mp4' })

    // Mock R2 asset creation error
    mockCreateR2Asset.mockRejectedValueOnce(new Error('R2 creation failed'))

    const { result } = renderHook(() => useUploadVideoVariant(), { wrapper })

    await act(async () => {
      await result.current.startUpload(
        file,
        'video-id',
        'language-id',
        'Standard'
      )
    })

    // Should set error state
    expect(result.current.uploadState.error).toBe('R2 creation failed')
    expect(result.current.uploadState.isUploading).toBe(false)
    expect(result.current.uploadState.isProcessing).toBe(false)
  })

  it('should clear upload state', async () => {
    const { result } = renderHook(() => useUploadVideoVariant(), { wrapper })

    // Set some state first
    await act(async () => {
      result.current.uploadState.isUploading = true
      result.current.uploadState.uploadProgress = 50
    })

    // Clear the state
    await act(async () => {
      result.current.clearUploadState()
    })

    // Should reset to initial state
    expect(result.current.uploadState).toEqual({
      isUploading: false,
      uploadProgress: 0,
      isProcessing: false,
      error: null,
      muxVideoId: null
    })
  })
})
