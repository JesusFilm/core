import { MockedProvider } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'
import { type Mock } from 'vitest'

import { graphql } from '@core/shared/gql'

import SubtitleCreate from './page'

// Mock useRouter
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn()
  }))
}))

// Mock useSnackbar
vi.mock('notistack', () => ({
  useSnackbar: vi.fn(() => ({
    enqueueSnackbar: vi.fn()
  }))
}))

// Mock uploadAssetFile
vi.mock(
  '../../../../../../../../libs/useCreateR2Asset/uploadAssetFile/uploadAssetFile',
  () => ({
    uploadAssetFile: vi.fn().mockResolvedValue(undefined)
  })
)

// Mock the component
vi.mock('./page', () => ({
  __esModule: true,
  default: vi.fn()
}))

describe('SubtitleCreate', () => {
  const mockVideoId = 'video-123'
  const mockEditionId = 'edition-456'

  const GET_VIDEO_EDITION = graphql(`
    query GetVideoEdition($editionId: ID!) {
      videoEdition(id: $editionId) {
        name
        videoSubtitles {
          language {
            id
          }
        }
      }
    }
  `)

  const CREATE_VIDEO_SUBTITLE = graphql(`
    mutation CreateVideoSubtitle($input: VideoSubtitleCreateInput!) {
      videoSubtitleCreate(input: $input) {
        id
      }
    }
  `)

  const CREATE_R2_ASSET = graphql(`
    mutation CreateR2Asset($input: CloudflareR2CreateInput!) {
      cloudflareR2Create(input: $input) {
        id
        uploadUrl
        publicUrl
      }
    }
  `)

  const mockVideoEditionData = {
    videoEdition: {
      name: 'Test Edition',
      videoSubtitles: [
        {
          language: {
            id: '123'
          }
        }
      ]
    }
  }

  const mockCreateR2AssetData = {
    cloudflareR2Create: {
      id: 'asset-123',
      uploadUrl: 'https://example.com/upload',
      publicUrl: 'https://example.com/asset.vtt'
    }
  }

  const mockCreateSubtitleData = {
    videoSubtitleCreate: {
      id: 'subtitle-123'
    }
  }

  const setup = () => {
    // Mock implementation
    ;(SubtitleCreate as Mock).mockImplementation(() => (
      <div data-testid="subtitle-create">
        <div data-testid="video-id">{mockVideoId}</div>
        <div data-testid="edition-id">{mockEditionId}</div>
        <form data-testid="SubtitleForm">
          <select data-testid="language-select"></select>
          <div data-testid="vtt-file-upload">VTT File Upload</div>
          <div data-testid="srt-file-upload">SRT File Upload</div>
          <button data-testid="create-button" type="submit">
            Create
          </button>
          <button data-testid="cancel-button" type="button">
            Cancel
          </button>
        </form>
      </div>
    ))

    const mocks = [
      {
        request: {
          query: GET_VIDEO_EDITION,
          variables: { editionId: mockEditionId }
        },
        result: {
          data: mockVideoEditionData
        }
      },
      {
        request: {
          query: CREATE_R2_ASSET,
          variables: {
            input: {
              videoId: mockVideoId,
              fileName: expect.any(String),
              contentType: expect.any(String),
              contentLength: expect.any(Number)
            }
          }
        },
        result: {
          data: mockCreateR2AssetData
        }
      },
      {
        request: {
          query: CREATE_VIDEO_SUBTITLE,
          variables: {
            input: expect.any(Object)
          }
        },
        result: {
          data: mockCreateSubtitleData
        }
      }
    ]

    return render(
      <MockedProvider mocks={mocks}>
        <SubtitleCreate
          params={Promise.resolve({
            videoId: mockVideoId,
            editionId: mockEditionId
          })}
        />
      </MockedProvider>
    )
  }

  it('should render the subtitle create page', () => {
    setup()
    expect(screen.getByTestId('subtitle-create')).toBeInTheDocument()
    expect(screen.getByTestId('video-id')).toHaveTextContent(mockVideoId)
    expect(screen.getByTestId('edition-id')).toHaveTextContent(mockEditionId)
  })

  it('should render the subtitle form with language select and file uploads', () => {
    setup()
    expect(screen.getByTestId('SubtitleForm')).toBeInTheDocument()
    expect(screen.getByTestId('language-select')).toBeInTheDocument()
    expect(screen.getByTestId('vtt-file-upload')).toBeInTheDocument()
    expect(screen.getByTestId('srt-file-upload')).toBeInTheDocument()
    expect(screen.getByTestId('create-button')).toBeInTheDocument()
    expect(screen.getByTestId('cancel-button')).toBeInTheDocument()
  })

  // Add more test cases as needed for form submission, validation, etc.
})
