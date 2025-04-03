import { InMemoryCache } from '@apollo/client'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import fetch, { Response } from 'node-fetch'
import { SnackbarProvider } from 'notistack'

import { GetAdminVideo_AdminVideo as AdminVideo } from '../../../../../../../../libs/useAdminVideo/useAdminVideo'
import { useAdminVideoMock } from '../../../../../../../../libs/useAdminVideo/useAdminVideo.mock'

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

const mockCreateCloudflareUploadByFile: MockedResponse<
  CreateCloudflareUploadByFile,
  CreateCloudflareUploadByFileVariables
> = {
  request: {
    query: CREATE_CLOUDFLARE_UPLOAD_BY_FILE,
    variables: { input: { videoId: '1_jf-0-0', aspectRatio: 'banner' } }
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

describe('VideoImageUpload', () => {
  const video: AdminVideo =
    useAdminVideoMock['result']?.['data']?.['adminVideo']

  it('should call mutations on file drop', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => await Promise.resolve(cfResponse)
    } as unknown as Response)

    const result = jest
      .fn()
      .mockReturnValue(mockCreateCloudflareUploadByFile.result)

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
              { ...mockCreateCloudflareUploadByFile, result },
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
            <VideoImageUpload video={video} />
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
        url: 'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/f7245a5d-5bf4-4343-764c-e0dd40369300'
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

  it('should not delete image if there are no images', async () => {
    const video: AdminVideo = {
      ...useAdminVideoMock['result']?.['data']?.['adminVideo'],
      images: []
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => await Promise.resolve(cfResponse)
    } as unknown as Response)

    const result = jest
      .fn()
      .mockReturnValue(mockCreateCloudflareUploadByFile.result)

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
              { ...mockCreateCloudflareUploadByFile, result },
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
            <VideoImageUpload video={video} />
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
        url: 'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/f7245a5d-5bf4-4343-764c-e0dd40369300'
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

  it('should call on upload complete when file dropped', async () => {
    const mockOnUploadComplete = jest.fn()
    render(
      
        <SnackbarProvider>
          <MockedProvider>
            <VideoImageUpload
              video={video}
              onUploadComplete={mockOnUploadComplete}
            />
          </MockedProvider>
        </SnackbarProvider>
      
    )
    const input = screen.getByTestId('DropZone')
    fireEvent.drop(input)
    await waitFor(() => expect(mockOnUploadComplete).toHaveBeenCalled())
  })

  it('should throw error if creation of cloudflare update fails', async () => {
    const result = jest.fn().mockReturnValue(null)

    render(
      
        <SnackbarProvider>
          <MockedProvider
            mocks={[{ ...mockCreateCloudflareUploadByFile, result }]}
          >
            <VideoImageUpload video={video} />
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

    await waitFor(() => {
      expect(result).toHaveBeenCalled()
    })
    expect(
      screen.getByText('Uploading failed, please try again')
    ).toBeInTheDocument()
  })

  it('should throw error if upload fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () =>
        await Promise.resolve({
          ...cfResponse,
          errors: [{ message: 'some error' }]
        })
    } as unknown as Response)

    const result = jest
      .fn()
      .mockReturnValue(mockCreateCloudflareUploadByFile.result)

    render(
      
        <SnackbarProvider>
          <MockedProvider
            mocks={[{ ...mockCreateCloudflareUploadByFile, result }]}
          >
            <VideoImageUpload video={video} />
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

    await waitFor(() => {
      expect(result).toHaveBeenCalled()
    })
    expect(
      screen.getByText('Uploading failed, please try again')
    ).toBeInTheDocument()
  })
})
