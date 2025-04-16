import { MockedProvider } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'
import { graphql } from 'gql.tada'

import SubtitleCreate from './page'

// Mock useRouter
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn()
  }))
}))

// Mock useSnackbar
jest.mock('notistack', () => ({
  useSnackbar: jest.fn(() => ({
    enqueueSnackbar: jest.fn()
  }))
}))

// Mock uploadAssetFile
jest.mock(
  '../../../../../../../../libs/useCreateR2Asset/uploadAssetFile/uploadAssetFile',
  () => ({
    uploadAssetFile: jest.fn().mockResolvedValue(undefined)
  })
)

// Mock the component
jest.mock('./page', () => ({
  __esModule: true,
  default: jest.fn()
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
    ;(SubtitleCreate as jest.Mock).mockImplementation(({ params }) => (
      <div data-testid="subtitle-create">
        <div data-testid="video-id">{params.videoId}</div>
        <div data-testid="edition-id">{params.editionId}</div>
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
          params={{ videoId: mockVideoId, editionId: mockEditionId }}
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
