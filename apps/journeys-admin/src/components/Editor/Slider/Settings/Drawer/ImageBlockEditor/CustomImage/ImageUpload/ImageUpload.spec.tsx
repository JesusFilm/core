import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import fetch, { Response } from 'node-fetch'

import { BlockFields_ImageBlock as ImageBlock } from '../../../../../../../../../__generated__/BlockFields'
import { CREATE_CLOUDFLARE_UPLOAD_BY_FILE } from '../../../../../../../../libs/useCloudflareUploadByFileMutation/useCloudflareUploadByFileMutation'

import { ImageUpload } from './ImageUpload'

jest.mock('node-fetch', () => {
  const originalModule = jest.requireActual('node-fetch')
  return {
    __esModule: true,
    ...originalModule,
    default: jest.fn()
  }
})

const mockFetch = fetch as jest.MockedFunction<typeof fetch>

describe('ImageUpload', () => {
  let originalEnv

  beforeEach(() => {
    originalEnv = process.env
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_CLOUDFLARE_UPLOAD_KEY: 'cloudflare-key'
    }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  const imageBlock: ImageBlock = {
    id: 'imageBlockId',
    __typename: 'ImageBlock',
    src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920',
    alt: 'random image from unsplash',
    width: 1600,
    height: 1067,
    blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL',
    parentBlockId: 'card',
    parentOrder: 0,
    scale: null,
    focalLeft: 50,
    focalTop: 50
  }

  const cfResponse = {
    result: {
      id: 'uploadId',
      uploaded: '2022-01-31T16:39:28.458Z',
      requireSignedURLs: true,
      variants: [
        'https://imagedelivery.net/cloudflare-key/uploadId/public',
        'https://imagedelivery.net/cloudflare-key/uploadId/thumbnail'
      ],
      draft: true
    },
    errors: [],
    messages: [],
    success: true
  }

  it('should check if the mutations gets called', async () => {
    const result = jest.fn(() => ({
      data: {
        createCloudflareUploadByUrl: {
          id: 'uploadId',
          upload: 'uploadUrl',
          __typename: 'CloudflareImage'
        }
      }
    }))
    const onChange = jest.fn()
    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: CREATE_CLOUDFLARE_UPLOAD_BY_FILE
            },
            result
          }
        ]}
      >
        <ImageUpload
          onChange={onChange}
          loading={false}
          selectedBlock={imageBlock}
        />
      </MockedProvider>
    )
    window.URL.createObjectURL = jest.fn().mockImplementation(() => 'url')
    const input = screen.getByTestId('drop zone')
    const file = new File(['file'], 'testFile.png', {
      type: 'image/png'
    })
    Object.defineProperty(input, 'files', {
      value: [file]
    })
    fireEvent.drop(input)
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should call onChange on file drop', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => await Promise.resolve(cfResponse)
    } as unknown as Response)

    const onChange = jest.fn()
    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: CREATE_CLOUDFLARE_UPLOAD_BY_FILE
            },
            result: {
              data: {
                createCloudflareUploadByFile: {
                  id: 'uploadId',
                  uploadUrl: 'https://upload.imagedelivery.net/uploadId',
                  userId: 'userId',
                  __typename: 'CloudflareImage'
                }
              }
            }
          }
        ]}
      >
        <ImageUpload
          onChange={onChange}
          loading={false}
          selectedBlock={imageBlock}
        />
      </MockedProvider>
    )
    const inputEl = screen.getByTestId('drop zone')
    Object.defineProperty(inputEl, 'files', {
      value: [
        new File([new Blob(['file'])], 'testFile.png', {
          type: 'image/png'
        })
      ]
    })
    fireEvent.drop(inputEl)
    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith({
        src: 'https://imagedelivery.net/cloudflare-key/uploadId/public',
        scale: 100,
        focalLeft: 50,
        focalTop: 50
      })
    )
    expect(screen.getByText('Upload successful!')).toBeInTheDocument()
  })

  it('should render loading state', () => {
    render(
      <MockedProvider>
        <ImageUpload onChange={jest.fn()} loading selectedBlock={imageBlock} />
      </MockedProvider>
    )
    expect(screen.getByTestId('Upload1Icon')).toBeInTheDocument()
    expect(screen.getByText('Uploading...')).toBeInTheDocument()
  })

  it('should render error state', () => {
    render(
      <MockedProvider>
        <ImageUpload
          onChange={jest.fn()}
          loading={false}
          selectedBlock={imageBlock}
          error
        />
      </MockedProvider>
    )
    expect(screen.getAllByTestId('AlertTriangleIcon')).toHaveLength(2)
    expect(screen.getByText('Upload Failed!')).toBeInTheDocument()
  })

  it('should call setUploading on file drop', async () => {
    const setUploading = jest.fn()
    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: CREATE_CLOUDFLARE_UPLOAD_BY_FILE
            },
            result: {
              data: {
                createCloudflareUploadByFile: {
                  id: 'uploadId',
                  uploadUrl: 'https://upload.imagedelivery.net/uploadId',
                  userId: 'userId',
                  __typename: 'CloudflareImage'
                }
              }
            }
          }
        ]}
      >
        <ImageUpload
          onChange={jest.fn()}
          setUploading={setUploading}
          loading
          selectedBlock={imageBlock}
          error
        />
      </MockedProvider>
    )
    const inputEl = screen.getByTestId('drop zone')
    Object.defineProperty(inputEl, 'files', {
      value: [
        new File([new Blob(['file'])], 'testFile.png', {
          type: 'image/png'
        })
      ]
    })
    fireEvent.drop(inputEl)
    await waitFor(() => expect(setUploading).toHaveBeenCalled())
    expect(screen.getByText('Uploading...')).toBeInTheDocument()
  })
})
