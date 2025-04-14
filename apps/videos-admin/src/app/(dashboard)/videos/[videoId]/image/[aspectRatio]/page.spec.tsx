import { InMemoryCache } from '@apollo/client'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import fetch, { Response } from 'node-fetch'
import { SnackbarProvider } from 'notistack'

import {
  CLOUDFLARE_UPLOAD_COMPLETE,
  CREATE_CLOUDFLARE_UPLOAD_BY_FILE,
  CloudflareUploadComplete,
  CloudflareUploadCompleteVariables,
  CreateCloudflareUploadByFile,
  CreateCloudflareUploadByFileVariables,
  DELETE_VIDEO_CLOUDFLARE_IMAGE,
  DeleteVideoCloudflareImage,
  DeleteVideoCloudflareImageVariables,
  ImageAspectRatio,
  VideoImageUpload
} from './VideoImageUpload'

jest.mock('node-fetch', () => {
  const originalModule = jest.requireActual('node-fetch')
  return {
    __esModule: true,
    ...originalModule,
    default: jest.fn()
  }
})
const mockFetch = fetch as jest.MockedFunction<typeof fetch>

const cfResponse = {
  result: {
    id: 'uploadId',
    uploaded: '2022-01-31T16:39:28.458Z',
    requireSignedURLs: true,
    variants: [
      'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/f7245a5d-5bf4-4343-764c-e0dd40369300/public',
      'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/f7245a5d-5bf4-4343-764c-e0dd40369300/thumbnail'
    ],
    draft: true
  },
  errors: [],
  messages: [],
  success: true
}

// Create mock for banner image upload
const mockCreateCloudflareUploadByFileBanner: MockedResponse<
  CreateCloudflareUploadByFile,
  CreateCloudflareUploadByFileVariables
> = {
  request: {
    query: CREATE_CLOUDFLARE_UPLOAD_BY_FILE,
    variables: {
      input: { videoId: '1_jf-0-0', aspectRatio: ImageAspectRatio.banner }
    }
  },
  result: {
    data: {
      createCloudflareUploadByFile: {
        uploadUrl:
          'https://upload.imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/f7245a5d-5bf4-4343-764c-e0dd40369300',
        id: 'uploadId',
        url: 'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/f7245a5d-5bf4-4343-764c-e0dd40369300',
        mobileCinematicHigh:
          'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/f7245a5d-5bf4-4343-764c-e0dd40369300/f=jpg,w=1280,h=600,q=95',
        videoStill: null,
        aspectRatio: 'banner',
        __typename: 'CloudflareImage'
      }
    }
  }
}

// Create mock for HD image upload
const mockCreateCloudflareUploadByFileHD: MockedResponse<
  CreateCloudflareUploadByFile,
  CreateCloudflareUploadByFileVariables
> = {
  request: {
    query: CREATE_CLOUDFLARE_UPLOAD_BY_FILE,
    variables: {
      input: { videoId: '1_jf-0-0', aspectRatio: ImageAspectRatio.hd }
    }
  },
  result: {
    data: {
      createCloudflareUploadByFile: {
        uploadUrl:
          'https://upload.imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/f7245a5d-5bf4-4343-764c-e0dd40369301',
        id: 'uploadId2',
        url: 'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/f7245a5d-5bf4-4343-764c-e0dd40369301',
        videoStill:
          'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/f7245a5d-5bf4-4343-764c-e0dd40369301/f=jpg,w=1280,h=720,q=95',
        mobileCinematicHigh: null,
        aspectRatio: 'hd',
        __typename: 'CloudflareImage'
      }
    }
  }
}

const mockCloudflareUploadComplete: MockedResponse<
  CloudflareUploadComplete,
  CloudflareUploadCompleteVariables
> = {
  request: {
    query: CLOUDFLARE_UPLOAD_COMPLETE,
    variables: { id: 'uploadId' }
  },
  result: {
    data: {
      cloudflareUploadComplete: true
    }
  }
}

const mockCloudflareUploadCompleteHD: MockedResponse<
  CloudflareUploadComplete,
  CloudflareUploadCompleteVariables
> = {
  request: {
    query: CLOUDFLARE_UPLOAD_COMPLETE,
    variables: { id: 'uploadId2' }
  },
  result: {
    data: {
      cloudflareUploadComplete: true
    }
  }
}

const mockDeleteCloudflareImage: MockedResponse<
  DeleteVideoCloudflareImage,
  DeleteVideoCloudflareImageVariables
> = {
  request: {
    query: DELETE_VIDEO_CLOUDFLARE_IMAGE,
    variables: { id: '1_jf-0-0.mobileCinematicHigh.jpg' }
  },
  result: {
    data: {
      deleteCloudflareImage: true
    }
  }
}

interface CloudflareImage {
  id: string
  url?: string | null
  mobileCinematicHigh?: string | null
  videoStill?: string | null
  aspectRatio?: string
}

interface VideoData {
  id: string
  images: CloudflareImage[]
}

describe('VideoImageUpload', () => {
  // Sample video data for testing
  const video: VideoData = {
    id: '1_jf-0-0',
    images: [
      {
        id: '1_jf-0-0.mobileCinematicHigh.jpg',
        url: 'https://example.com/image.jpg',
        mobileCinematicHigh: 'https://example.com/image-mobile.jpg',
        videoStill: null,
        aspectRatio: 'banner'
      }
    ]
  }

  it('should call mutations on file drop for banner image', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => await Promise.resolve(cfResponse)
    } as unknown as Response)

    const result = jest
      .fn()
      .mockReturnValue(mockCreateCloudflareUploadByFileBanner.result)

    const result2 = jest
      .fn()
      .mockReturnValue(mockCloudflareUploadComplete.result)
    const result3 = jest.fn().mockReturnValue(mockDeleteCloudflareImage.result)

    const cache = new InMemoryCache()
    cache.restore({
      'Video:1_jf-0-0': {
        images: [{ __ref: 'CloudflareImage:imageId' }]
      },
      'CloudflareImage:imageId': {
        id: 'imageId',
        __typename: 'CloudflareImage'
      }
    })

    render(
      <SnackbarProvider>
        <MockedProvider
          cache={cache}
          mocks={[
            { ...mockCreateCloudflareUploadByFileBanner, result },
            {
              ...mockCloudflareUploadComplete,
              result: result2
            },
            {
              ...mockDeleteCloudflareImage,
              result: result3
            }
          ]}
        >
          <VideoImageUpload
            video={video}
            aspectRatio={ImageAspectRatio.banner}
          />
        </MockedProvider>
      </SnackbarProvider>
    )
    const input = screen.getByTestId('DropZone')
    const file = new File(['file'], 'testFile.png', {
      type: 'image/png'
    })
    Object.defineProperty(input, 'files', {
      value: [file]
    })
    fireEvent.drop(input)
    await waitFor(() => expect(result).toHaveBeenCalled())
    await waitFor(() => expect(result2).toHaveBeenCalled())
    await waitFor(() => expect(result3).toHaveBeenCalled())
    expect(cache.extract()).toEqual({
      'CloudflareImage:imageId': {
        __typename: 'CloudflareImage',
        id: 'imageId'
      },
      'CloudflareImage:uploadId': {
        __typename: 'CloudflareImage',
        id: 'uploadId',
        mobileCinematicHigh:
          'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/f7245a5d-5bf4-4343-764c-e0dd40369300/f=jpg,w=1280,h=600,q=95',
        uploadUrl:
          'https://upload.imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/f7245a5d-5bf4-4343-764c-e0dd40369300',
        url: 'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/f7245a5d-5bf4-4343-764c-e0dd40369300',
        videoStill: null,
        aspectRatio: 'banner'
      },
      ROOT_MUTATION: { __typename: 'Mutation' },
      'Video:1_jf-0-0': {
        images: [
          { __ref: 'CloudflareImage:imageId' },
          { __ref: 'CloudflareImage:uploadId' }
        ]
      },
      __META: { extraRootIds: ['CloudflareImage:uploadId'] }
    })
  })

  it('should call mutations on file drop for HD image', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => await Promise.resolve(cfResponse)
    } as unknown as Response)

    const result = jest
      .fn()
      .mockReturnValue(mockCreateCloudflareUploadByFileHD.result)

    const result2 = jest
      .fn()
      .mockReturnValue(mockCloudflareUploadCompleteHD.result)

    // We're using an empty array for images to simulate no existing HD image
    const videoWithNoHDImage: VideoData = {
      id: '1_jf-0-0',
      images: []
    }

    const cache = new InMemoryCache()
    cache.restore({
      'Video:1_jf-0-0': {
        images: []
      }
    })

    render(
      <SnackbarProvider>
        <MockedProvider
          cache={cache}
          mocks={[
            { ...mockCreateCloudflareUploadByFileHD, result },
            {
              ...mockCloudflareUploadCompleteHD,
              result: result2
            }
          ]}
        >
          <VideoImageUpload
            video={videoWithNoHDImage}
            aspectRatio={ImageAspectRatio.hd}
          />
        </MockedProvider>
      </SnackbarProvider>
    )
    const input = screen.getByTestId('DropZone')
    const file = new File(['file'], 'testFile.png', {
      type: 'image/png'
    })
    Object.defineProperty(input, 'files', {
      value: [file]
    })
    fireEvent.drop(input)
    await waitFor(() => expect(result).toHaveBeenCalled())
    await waitFor(() => expect(result2).toHaveBeenCalled())
  })

  it('should not delete image if there are no existing images', async () => {
    const videoWithNoImages: VideoData = {
      id: '1_jf-0-0',
      images: []
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => await Promise.resolve(cfResponse)
    } as unknown as Response)

    const result = jest
      .fn()
      .mockReturnValue(mockCreateCloudflareUploadByFileBanner.result)

    const result2 = jest
      .fn()
      .mockReturnValue(mockCloudflareUploadComplete.result)
    const result3 = jest.fn().mockReturnValue(mockDeleteCloudflareImage.result)

    const cache = new InMemoryCache()
    cache.restore({
      'Video:1_jf-0-0': {
        images: []
      }
    })

    render(
      <SnackbarProvider>
        <MockedProvider
          cache={cache}
          mocks={[
            { ...mockCreateCloudflareUploadByFileBanner, result },
            {
              ...mockCloudflareUploadComplete,
              result: result2
            },
            {
              ...mockDeleteCloudflareImage,
              result: result3
            }
          ]}
        >
          <VideoImageUpload
            video={videoWithNoImages}
            aspectRatio={ImageAspectRatio.banner}
          />
        </MockedProvider>
      </SnackbarProvider>
    )
    const input = screen.getByTestId('DropZone')
    const file = new File(['file'], 'testFile.png', {
      type: 'image/png'
    })
    Object.defineProperty(input, 'files', {
      value: [file]
    })
    fireEvent.drop(input)
    await waitFor(() => expect(result).toHaveBeenCalled())
    await waitFor(() => expect(result2).toHaveBeenCalled())
    await waitFor(() => expect(result3).not.toHaveBeenCalled())
    expect(cache.extract()).toEqual({
      ROOT_MUTATION: { __typename: 'Mutation' },
      'Video:1_jf-0-0': {
        images: [{ __ref: 'CloudflareImage:uploadId' }]
      },
      'CloudflareImage:uploadId': {
        __typename: 'CloudflareImage',
        id: 'uploadId',
        mobileCinematicHigh:
          'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/f7245a5d-5bf4-4343-764c-e0dd40369300/f=jpg,w=1280,h=600,q=95',
        uploadUrl:
          'https://upload.imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/f7245a5d-5bf4-4343-764c-e0dd40369300',
        url: 'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/f7245a5d-5bf4-4343-764c-e0dd40369300',
        videoStill: null,
        aspectRatio: 'banner'
      },
      __META: { extraRootIds: ['CloudflareImage:uploadId'] }
    })
  })

  it('should show error message if upload fails', async () => {
    const videoWithNoImages: VideoData = {
      id: '1_jf-0-0',
      images: []
    }

    const mockCreateCloudflareUploadByFileError: MockedResponse<
      CreateCloudflareUploadByFile,
      CreateCloudflareUploadByFileVariables
    > = {
      request: {
        query: CREATE_CLOUDFLARE_UPLOAD_BY_FILE,
        variables: {
          input: { videoId: '1_jf-0-0', aspectRatio: ImageAspectRatio.banner }
        }
      },
      error: new Error('Upload failed')
    }

    // Reset the mock fetch before the test
    mockFetch.mockReset()

    render(
      <SnackbarProvider>
        <MockedProvider mocks={[mockCreateCloudflareUploadByFileError]}>
          <VideoImageUpload
            video={videoWithNoImages}
            aspectRatio={ImageAspectRatio.banner}
          />
        </MockedProvider>
      </SnackbarProvider>
    )
    const input = screen.getByTestId('DropZone')
    const file = new File(['file'], 'testFile.png', {
      type: 'image/png'
    })
    Object.defineProperty(input, 'files', {
      value: [file]
    })
    fireEvent.drop(input)

    // Check for error notification
    await waitFor(() => {
      expect(
        screen.getByText('Uploading failed, please try again')
      ).toBeInTheDocument()
    })
  })

  it('should show error message if cloudflare upload errors exist', async () => {
    const videoWithNoImages: VideoData = {
      id: '1_jf-0-0',
      images: []
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () =>
        await Promise.resolve({
          ...cfResponse,
          errors: ['Upload failed']
        })
    } as unknown as Response)

    render(
      <SnackbarProvider>
        <MockedProvider mocks={[mockCreateCloudflareUploadByFileBanner]}>
          <VideoImageUpload
            video={videoWithNoImages}
            aspectRatio={ImageAspectRatio.banner}
          />
        </MockedProvider>
      </SnackbarProvider>
    )
    const input = screen.getByTestId('DropZone')
    const file = new File(['file'], 'testFile.png', {
      type: 'image/png'
    })
    Object.defineProperty(input, 'files', {
      value: [file]
    })
    fireEvent.drop(input)
    await waitFor(() => expect(mockFetch).toHaveBeenCalled())
  })

  it('should show error message if fetch throws', async () => {
    const videoWithNoImages: VideoData = {
      id: '1_jf-0-0',
      images: []
    }

    mockFetch.mockRejectedValueOnce(new Error('Fetch failed'))

    render(
      <SnackbarProvider>
        <MockedProvider mocks={[mockCreateCloudflareUploadByFileBanner]}>
          <VideoImageUpload
            video={videoWithNoImages}
            aspectRatio={ImageAspectRatio.banner}
          />
        </MockedProvider>
      </SnackbarProvider>
    )
    const input = screen.getByTestId('DropZone')
    const file = new File(['file'], 'testFile.png', {
      type: 'image/png'
    })
    Object.defineProperty(input, 'files', {
      value: [file]
    })
    fireEvent.drop(input)
    await waitFor(() => expect(mockFetch).toHaveBeenCalled())
  })
})
