import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import fetch, { Response } from 'node-fetch'

import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../../../__generated__/GetJourney'

import { CREATE_CLOUDFLARE_UPLOAD_BY_FILE, ImageUpload } from './ImageUpload'

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
  const imageBlock: ImageBlock = {
    id: 'imageBlockId',
    __typename: 'ImageBlock',
    src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920',
    alt: 'random image from unsplash',
    width: 1600,
    height: 1067,
    blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL',
    parentBlockId: 'card',
    parentOrder: 0
  }

  const cfResponse = {
    result: {
      id: 'uploadId',
      uploaded: '2022-01-31T16:39:28.458Z',
      requireSignedURLs: true,
      variants: [
        'https://imagedelivery.net/Vi7wi5KSItxGFsWRG2Us6Q/uploadId/public',
        'https://imagedelivery.net/Vi7wi5KSItxGFsWRG2Us6Q/uploadId/thumbnail'
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
    const { getByTestId } = render(
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
    const input = getByTestId('drop zone')
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
    const { getByTestId, getByText } = render(
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
    const inputEl = getByTestId('drop zone')
    Object.defineProperty(inputEl, 'files', {
      value: [
        new File([new Blob(['file'])], 'testFile.png', {
          type: 'image/png'
        })
      ]
    })
    fireEvent.drop(inputEl)
    await waitFor(() => expect(onChange).toHaveBeenCalled())
    expect(getByText('Upload successful!')).toBeInTheDocument()
  })

  it('should render loading state', () => {
    const { getByTestId, getByText } = render(
      <MockedProvider>
        <ImageUpload onChange={jest.fn()} loading selectedBlock={imageBlock} />
      </MockedProvider>
    )
    expect(getByTestId('BackupOutlinedIcon')).toBeInTheDocument()
    expect(getByText('Uploading...')).toBeInTheDocument()
  })

  it('should render error state', () => {
    const { getByTestId, getByText } = render(
      <MockedProvider>
        <ImageUpload
          onChange={jest.fn()}
          loading={false}
          selectedBlock={imageBlock}
          error
        />
      </MockedProvider>
    )
    expect(getByTestId('CloudOffRoundedIcon')).toBeInTheDocument()
    expect(getByText('Upload Failed!')).toBeInTheDocument()
  })

  it('should call setUploading on file drop', async () => {
    const setUploading = jest.fn()
    const { getByTestId, getByText } = render(
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
    const inputEl = getByTestId('drop zone')
    Object.defineProperty(inputEl, 'files', {
      value: [
        new File([new Blob(['file'])], 'testFile.png', {
          type: 'image/png'
        })
      ]
    })
    fireEvent.drop(inputEl)
    await waitFor(() => expect(setUploading).toHaveBeenCalled())
    expect(getByText('Uploading...')).toBeInTheDocument()
  })
})
