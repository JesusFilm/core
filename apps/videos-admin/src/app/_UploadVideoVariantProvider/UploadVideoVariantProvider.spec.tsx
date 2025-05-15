import { MockedProvider } from '@apollo/client/testing'
import { act, renderHook, waitFor } from '@testing-library/react'
import axios from 'axios'
import { SnackbarProvider } from 'notistack'
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

// Mock R2 asset creation
jest.mock('../../libs/useCreateR2Asset/useCreateR2Asset', () => ({
  useCreateR2Asset: jest.fn(() => ({
    createAsset: jest.fn(),
    loading: false,
    error: null
  }))
}))

// Mock useSnackbar
jest.mock('notistack', () => {
  const mockEnqueueSnackbar = jest.fn()
  return {
    ...jest.requireActual('notistack'),
    useSnackbar: jest.fn(() => ({
      enqueueSnackbar: mockEnqueueSnackbar
    }))
  }
})

// Create a wrapper with the necessary providers
const createWrapper = (mocks = []) => {
  return ({ children }: { children: ReactNode }) => (
    <SnackbarProvider>
      <MockedProvider mocks={mocks} addTypename={false}>
        <UploadVideoVariantProvider>{children}</UploadVideoVariantProvider>
      </MockedProvider>
    </SnackbarProvider>
  )
}

// Set up mock response data
const mockMuxVideoId = 'mux-video-123'
const mockVideoId = 'video-123'
const mockS3Url = 'https://example.com/s3'
const mockFile = new File(['test'], 'test.mp4', { type: 'video/mp4' })

describe('UploadVideoVariantProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create S3 upload url and create mux video by URL', async () => {
    // Setup mocks
    const createR2AssetMock = jest.fn().mockResolvedValue({
      id: 'asset-id',
      signedUrl: mockS3Url
    })

    // Update the mock implementation for this test
    require('../../libs/useCreateR2Asset/useCreateR2Asset').useCreateR2Asset.mockReturnValue({
      createAsset: createR2AssetMock,
      loading: false,
      error: null
    })

    // Create GraphQL mocks
    const createMuxVideoMock = jest.fn().mockReturnValue({
      data: {
        muxVideoCreateByURL: {
          id: mockMuxVideoId,
          status: 'preparing'
        }
      }
    })

    const createVideoVariantMock = jest.fn().mockReturnValue({
      data: {
        videoVariantCreate: {
          id: 'variant-id',
          video: {
            id: mockVideoId
          }
        }
      }
    })

    const getMuxVideoMock = jest.fn().mockReturnValue({
      data: {
        myMuxVideo: {
          id: mockMuxVideoId,
          status: 'ready'
        }
      }
    })

    const mocks = [
      {
        request: {
          query: CREATE_MUX_VIDEO_UPLOAD_BY_URL,
          variables: {
            input: {
              url: mockS3Url
            }
          }
        },
        result: createMuxVideoMock
      },
      {
        request: {
          query: CREATE_VIDEO_VARIANT,
          variables: {
            input: {
              videoId: mockVideoId,
              muxVideoId: mockMuxVideoId,
              r2VideoAssetId: 'asset-id'
            }
          }
        },
        result: createVideoVariantMock
      },
      {
        request: {
          query: GET_MY_MUX_VIDEO,
          variables: {
            id: mockMuxVideoId
          }
        },
        result: getMuxVideoMock
      }
    ]

    // Get access to the mock to verify calls
    const { useSnackbar } = require('notistack')
    const enqueueSnackbarMock = jest.fn()
    useSnackbar.mockReturnValue({
      enqueueSnackbar: enqueueSnackbarMock
    })

    // Render the hook with mocks
    const { result } = renderHook(() => useUploadVideoVariant(), {
      wrapper: createWrapper(mocks)
    })

    // Test the upload process
    await act(async () => {
      await result.current.uploadVideoVariant({
        file: mockFile,
        videoId: mockVideoId
      })
    })

    // Verify the flow was completed correctly
    await waitFor(() => {
      expect(createR2AssetMock).toHaveBeenCalledWith({
        file: mockFile,
        type: 'video'
      })
    })

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(mockS3Url, mockFile, {
        headers: {
          'Content-Type': 'video/mp4'
        }
      })
    })

    await waitFor(() => {
      expect(createMuxVideoMock).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(createVideoVariantMock).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(getMuxVideoMock).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(enqueueSnackbarMock).toHaveBeenCalledWith(
        'Video variant created successfully',
        { variant: 'success' }
      )
    })

    // Verify state was reset
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBe(null)
  })

  it('should handle errors during upload process', async () => {
    // Mock a failed S3 upload
    const errorMessage = 'Failed to upload to S3'
    require('axios').put.mockRejectedValueOnce(new Error(errorMessage))

    // Mock R2 asset creation
    const createR2AssetMock = jest.fn().mockResolvedValue({
      id: 'asset-id',
      signedUrl: mockS3Url
    })

    require('../../libs/useCreateR2Asset/useCreateR2Asset').useCreateR2Asset.mockReturnValue({
      createAsset: createR2AssetMock,
      loading: false,
      error: null
    })

    // Get access to the mock to verify calls
    const { useSnackbar } = require('notistack')
    const enqueueSnackbarMock = jest.fn()
    useSnackbar.mockReturnValue({
      enqueueSnackbar: enqueueSnackbarMock
    })

    // Render the hook
    const { result } = renderHook(() => useUploadVideoVariant(), {
      wrapper: createWrapper([])
    })

    // Test the upload process with error
    await act(async () => {
      await result.current.uploadVideoVariant({
        file: mockFile,
        videoId: mockVideoId
      })
    })

    // Verify error handling
    await waitFor(() => {
      expect(enqueueSnackbarMock).toHaveBeenCalledWith(
        'Error uploading file: Failed to upload to S3',
        { variant: 'error' }
      )
    })

    expect(result.current.isLoading).toBe(false)
  })

  it('should handle errors from createAsset', async () => {
    // Mock R2 asset creation with error
    const errorMessage = 'Failed to create R2 asset'
    require('../../libs/useCreateR2Asset/useCreateR2Asset').useCreateR2Asset.mockReturnValue({
      createAsset: jest.fn().mockRejectedValue(new Error(errorMessage)),
      loading: false,
      error: null
    })

    // Get access to the mock to verify calls
    const { useSnackbar } = require('notistack')
    const enqueueSnackbarMock = jest.fn()
    useSnackbar.mockReturnValue({
      enqueueSnackbar: enqueueSnackbarMock
    })

    // Render the hook
    const { result } = renderHook(() => useUploadVideoVariant(), {
      wrapper: createWrapper([])
    })

    // Test the upload process with error
    await act(async () => {
      await result.current.uploadVideoVariant({
        file: mockFile,
        videoId: mockVideoId
      })
    })

    // Verify error handling
    await waitFor(() => {
      expect(enqueueSnackbarMock).toHaveBeenCalledWith(
        `Error creating asset: ${errorMessage}`,
        { variant: 'error' }
      )
    })

    expect(result.current.isLoading).toBe(false)
  })
})
