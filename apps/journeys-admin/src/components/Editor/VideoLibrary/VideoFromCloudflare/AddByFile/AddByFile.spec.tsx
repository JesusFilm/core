import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import fetch, { Response } from 'node-fetch'
import { VideoBlockSource } from 'libs/journeys/ui/__generated__/globalTypes'
import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../../../__generated__/GetJourney'
import {
  CREATE_CLOUDFLARE_VIDEO_UPLOAD_BY_FILE,
  VideoUpload
} from './AddByFile'

jest.mock('node-fetch', () => {
  const originalModule = jest.requireActual('node-fetch')
  return {
    __esModule: true,
    ...originalModule,
    default: jest.fn()
  }
})

const mockFetch = fetch as jest.MockedFunction<typeof fetch>

describe('AddByFile', () => {
  const videoBlock: VideoBlock = {
    id: 'imageBlockId',
    __typename: 'VideoBlock',
    parentBlockId: 'card',
    parentOrder: 0,
    muted: false,
    autoplay: false,
    startAt: 0,
    endAt: 0,
    posterBlockId: null,
    fullsize: false,
    videoId: 'videoId',
    videoVariantLanguageId: null,
    source: VideoBlockSource.cloudflare,
    title: null,
    description: null,
    image: null,
    duration: null,
    objectFit: null,
    video: null,
    action: null
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
        createCloudflareVideoUploadByFile: {
          id: 'uploadId',
          uploadUrl: 'https://example.com/upload',
          __typename: 'CloudflareVideo'
        }
      }
    }))
    const onChange = jest.fn()
    const { getByTestId } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: CREATE_CLOUDFLARE_VIDEO_UPLOAD_BY_FILE,
              variables: {
                uploadLength: 4,
                name: 'testFile'
              }
            },
            result
          }
        ]}
      >
        <VideoUpload onChange={onChange} />
      </MockedProvider>
    )
    window.URL.createObjectURL = jest.fn().mockImplementation(() => 'url')
    const input = getByTestId('drop zone')
    const file = new File(['file'], 'testFile.mp4', {
      type: 'video/mp4'
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
              query: CREATE_CLOUDFLARE_VIDEO_UPLOAD_BY_FILE
            },
            result: {
              data: {
                createCloudflareVideoUploadByFile: {
                  id: 'uploadId',
                  uploadUrl: 'https://example.com/upload',
                  __typename: 'CloudflareVideo'
                }
              }
            }
          }
        ]}
      >
        <VideoUpload
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
        <VideoUpload onChange={jest.fn()} />
      </MockedProvider>
    )
    expect(getByTestId('BackupOutlinedIcon')).toBeInTheDocument()
    expect(getByText('Uploading...')).toBeInTheDocument()
  })

  it('should render error state', () => {
    const { getByTestId, getByText } = render(
      <MockedProvider>
        <VideoUpload onChange={jest.fn()} />
      </MockedProvider>
    )
    expect(getByTestId('CloudOffRoundedIcon')).toBeInTheDocument()
    expect(getByText('Upload Failed!'))
  })
})
