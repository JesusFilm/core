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
    expect(screen.getByText('Upload Successful!')).toBeInTheDocument()
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

  it('should handle file too large error', async () => {
    const onChange = jest.fn()
    const setUploading = jest.fn()

    render(
      <MockedProvider>
        <ImageUpload
          onChange={onChange}
          setUploading={setUploading}
          loading={false}
          selectedBlock={imageBlock}
        />
      </MockedProvider>
    )

    const inputEl = screen.getByTestId('drop zone')

    const largeFile = new File([new ArrayBuffer(11000000)], 'large-image.png', {
      type: 'image/png'
    })

    Object.defineProperty(inputEl, 'files', {
      value: [largeFile]
    })

    fireEvent.drop(inputEl)

    await waitFor(() => {
      expect(screen.getByText('Upload Failed!')).toBeInTheDocument()
      expect(
        screen.getByText(
          'File size exceeds the maximum allowed size (10 MB). Please choose a smaller file'
        )
      ).toBeInTheDocument()
      expect(screen.getAllByTestId('AlertTriangleIcon')).toHaveLength(2)
    })

    expect(setUploading).toHaveBeenCalledWith(false)
    expect(onChange).not.toHaveBeenCalled()

    expect(
      screen.getByRole('button', { name: 'Upload file' })
    ).not.toBeDisabled()
  })

  it('should handle wrong file type error', async () => {
    const onChange = jest.fn()
    const setUploading = jest.fn()

    render(
      <MockedProvider>
        <ImageUpload
          onChange={onChange}
          setUploading={setUploading}
          loading={false}
          selectedBlock={imageBlock}
        />
      </MockedProvider>
    )

    const inputEl = screen.getByTestId('drop zone')

    const pdfFile = new File([new Blob(['file'])], 'document.pdf', {
      type: 'application/pdf'
    })

    Object.defineProperty(inputEl, 'files', {
      value: [pdfFile]
    })

    fireEvent.drop(inputEl)

    await waitFor(() => {
      expect(screen.getByText('Upload Failed!')).toBeInTheDocument()
      expect(
        screen.getByText(
          'File type not accepted. Please upload one of the following: (PNG, JPG, GIF, SVG, or HEIC)'
        )
      ).toBeInTheDocument()
      expect(screen.getAllByTestId('AlertTriangleIcon')).toHaveLength(2)
    })

    expect(setUploading).toHaveBeenCalledWith(false)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('should handle Cloudflare error response', async () => {
    const cfErrorResponse = {
      result: {
        id: 'uploadId'
      },
      errors: [
        {
          code: 5000,
          message: 'Upload failed'
        }
      ],
      messages: [],
      success: false
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => await Promise.resolve(cfErrorResponse)
    } as unknown as Response)

    const onChange = jest.fn()
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
          onChange={onChange}
          setUploading={setUploading}
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

    await waitFor(() => {
      expect(screen.getByText('Upload Failed!')).toBeInTheDocument()
      expect(
        screen.getByText('Something went wrong, try again')
      ).toBeInTheDocument()
      expect(screen.getAllByTestId('AlertTriangleIcon')).toHaveLength(2)
    })

    expect(setUploading).toHaveBeenCalledWith(false)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('should clear error when retrying with valid file after error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => await Promise.resolve(cfResponse)
    } as unknown as Response)

    const onChange = jest.fn()
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
          onChange={onChange}
          setUploading={setUploading}
          loading={false}
          selectedBlock={imageBlock}
        />
      </MockedProvider>
    )

    const inputEl = screen.getByTestId('drop zone')

    const largeFile = new File([new ArrayBuffer(11000000)], 'large-image.png', {
      type: 'image/png'
    })

    Object.defineProperty(inputEl, 'files', {
      value: [largeFile],
      configurable: true
    })

    fireEvent.drop(inputEl)

    await waitFor(() => {
      expect(screen.getByText('Upload Failed!')).toBeInTheDocument()
      expect(
        screen.getByText(
          'File size exceeds the maximum allowed size (10 MB). Please choose a smaller file'
        )
      ).toBeInTheDocument()
    })

    const validFile = new File([new Blob(['file'])], 'valid-image.png', {
      type: 'image/png'
    })

    Object.defineProperty(inputEl, 'files', {
      value: [validFile],
      configurable: true
    })

    fireEvent.drop(inputEl)

    await waitFor(() => {
      expect(screen.queryByText('Upload Failed!')).not.toBeInTheDocument()
      expect(
        screen.queryByText(
          'File size exceeds the maximum allowed size (10 MB). Please choose a smaller file'
        )
      ).not.toBeInTheDocument()
      expect(screen.getByText('Upload Successful!')).toBeInTheDocument()
    })

    expect(onChange).toHaveBeenCalledWith({
      src: 'https://imagedelivery.net/cloudflare-key/uploadId/public',
      scale: 100,
      focalLeft: 50,
      focalTop: 50
    })
  })
})
