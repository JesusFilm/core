import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import fetch, { Response } from 'node-fetch'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { publishedJourney } from '@core/journeys/ui/TemplateView/data'

import { cloudflareUploadMutationMock } from '../../../../../../libs/useCloudflareUploadByFileMutation/useCloudflareUploadByFileMutation.mock'
import { journeyImageBlockCreateMock } from '../../../../../../libs/useJourneyImageBlockCreateMutation/useJourneyImageBlockCreateMutation.mock'
import { journeyImageBlockUpdateMock } from '../../../../../../libs/useJourneyImageBlockUpdateMutation/useJourneyImageBlockUpdateMutation.mock'
import { journeyImageBlockAssociationUpdateMock } from '../../../../../../libs/useJourneyImageBlockAssociationUpdateMutation/useJourneyImageBlockAssociationUpdateMutation.mock'

import { SocialScreenSocialImage } from './SocialScreenSocialImage'

jest.mock('node-fetch', () => {
  const originalModule = jest.requireActual('node-fetch')
  return {
    __esModule: true,
    ...originalModule,
    default: jest.fn()
  }
})

const mockFetch = fetch as jest.MockedFunction<typeof fetch>

describe('SocialScreenSocialImage', () => {
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
    jest.clearAllMocks()
  })

  const mockJourney = {
    ...publishedJourney,
    id: 'journeyId',
    primaryImageBlock: {
      id: 'imageBlockId',
      __typename: 'ImageBlock' as const,
      parentBlockId: null,
      parentOrder: 0,
      src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920',
      alt: 'random image from unsplash',
      width: 1920,
      height: 1080,
      blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL',
      scale: null,
      focalLeft: 50,
      focalTop: 50
    }
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

  it('renders the primary image of a journey', async () => {
    render(
      <MockedProvider>
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: mockJourney,
              variant: 'admin'
            }}
          >
            <SocialScreenSocialImage />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('img')).toHaveAttribute(
      'alt',
      'random image from unsplash'
    )
    await waitFor(() =>
      expect(screen.getByRole('img')).toHaveAttribute(
        'src',
        expect.stringMatching(
          /\/_next\/image\?url=https%3A%2F%2Fimages\.unsplash\.com%2Fphoto-1508363778367-af363f107cbb.*?/
        )
      )
    )
  })

  it('should display placeholder icon when no image set', () => {
    render(
      <MockedProvider>
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: { ...publishedJourney, primaryImageBlock: null },
              variant: 'admin'
            }}
          >
            <SocialScreenSocialImage />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(screen.getByTestId('GridEmptyIcon')).toBeInTheDocument()
  })

  it('should update existing image when file is uploaded', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => await Promise.resolve(cfResponse)
    } as unknown as Response)

    const updateMock = { ...journeyImageBlockUpdateMock }
    updateMock.result = jest.fn(() => ({
      data: {
        imageBlockUpdate: {
          __typename: 'ImageBlock',
          id: 'imageBlockId',
          parentBlockId: null,
          parentOrder: 0,
          src: 'https://imagedelivery.net/cloudflare-key/uploadId/public',
          alt: 'journey image',
          width: 1920,
          height: 1080,
          blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL',
          scale: null,
          focalTop: null,
          focalLeft: null
        }
      }
    }))

    render(
      <MockedProvider mocks={[cloudflareUploadMutationMock, updateMock]}>
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: mockJourney,
              variant: 'admin'
            }}
          >
            <SocialScreenSocialImage />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    const fileInput = screen.getByTestId('SocialScreenSocialImageInput')
    const file = new File(['file'], 'testFile.png', { type: 'image/png' })

    fireEvent.change(fileInput, { target: { files: [file] } })

    await waitFor(() => {
      expect(cloudflareUploadMutationMock.result).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(updateMock.result).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(screen.getByText('Social image updated')).toBeInTheDocument()
    })
  })

  it('should create new image when no existing image block', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => await Promise.resolve(cfResponse)
    } as unknown as Response)

    const createMock = { ...journeyImageBlockCreateMock }
    createMock.result = jest.fn(() => ({
      data: {
        imageBlockCreate: {
          __typename: 'ImageBlock',
          id: 'newImageBlockId',
          parentBlockId: null,
          parentOrder: 0,
          src: 'https://imagedelivery.net/cloudflare-key/uploadId/public',
          alt: 'journey image',
          width: 1920,
          height: 1080,
          blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL',
          scale: null,
          focalTop: null,
          focalLeft: null
        }
      }
    }))

    const associationMock = {
      ...journeyImageBlockAssociationUpdateMock,
      request: {
        ...journeyImageBlockAssociationUpdateMock.request,
        variables: {
          id: 'journeyId',
          input: { primaryImageBlockId: 'newImageBlockId' }
        }
      }
    }
    associationMock.result = jest.fn(() => ({
      data: {
        journeyUpdate: {
          __typename: 'Journey',
          id: 'journeyId',
          primaryImageBlock: {
            __typename: 'ImageBlock',
            id: 'newImageBlockId'
          },
          creatorImageBlock: null
        }
      }
    }))

    render(
      <MockedProvider
        mocks={[cloudflareUploadMutationMock, createMock, associationMock]}
      >
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: {
                ...publishedJourney,
                id: 'journeyId',
                primaryImageBlock: null
              },
              variant: 'admin'
            }}
          >
            <SocialScreenSocialImage />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    const fileInput = screen.getByTestId('SocialScreenSocialImageInput')
    const file = new File(['file'], 'testFile.png', { type: 'image/png' })

    fireEvent.change(fileInput, { target: { files: [file] } })

    await waitFor(() => {
      expect(cloudflareUploadMutationMock.result).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(createMock.result).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(associationMock.result).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(screen.getByText('Social image updated')).toBeInTheDocument()
    })
  })

  it('should handle upload error gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Upload failed'))

    render(
      <MockedProvider mocks={[cloudflareUploadMutationMock]}>
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: mockJourney,
              variant: 'admin'
            }}
          >
            <SocialScreenSocialImage />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    const fileInput = screen.getByTestId('SocialScreenSocialImageInput')
    const file = new File(['file'], 'testFile.png', { type: 'image/png' })

    fireEvent.change(fileInput, { target: { files: [file] } })

    await waitFor(() => {
      expect(
        screen.getByText(
          'Failed to update social image, please try again later'
        )
      ).toBeInTheDocument()
    })
  })

  it('should not upload when no file is selected', async () => {
    render(
      <MockedProvider mocks={[cloudflareUploadMutationMock]}>
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: mockJourney,
              variant: 'admin'
            }}
          >
            <SocialScreenSocialImage />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    const fileInput = screen.getByTestId('SocialScreenSocialImageInput')

    fireEvent.change(fileInput, { target: { files: null } })

    await waitFor(() => {
      expect(cloudflareUploadMutationMock.result).not.toHaveBeenCalled()
    })
  })

  it('should show loading state during upload', async () => {
    mockFetch.mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => await Promise.resolve(cfResponse)
              } as unknown as Response),
            100
          )
        )
    )

    render(
      <MockedProvider
        mocks={[cloudflareUploadMutationMock, journeyImageBlockUpdateMock]}
      >
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: mockJourney,
              variant: 'admin'
            }}
          >
            <SocialScreenSocialImage />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    const fileInput = screen.getByTestId('SocialScreenSocialImageInput')
    const file = new File(['file'], 'testFile.png', { type: 'image/png' })

    fireEvent.change(fileInput, { target: { files: [file] } })

    expect(
      screen.getByTestId('SocialScreenSocialImageSkeleton')
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('SocialScreenSocialImageCircularProgress')
    ).toBeInTheDocument()

    await waitFor(() => {
      expect(
        screen.queryByTestId('SocialScreenSocialImageSkeleton')
      ).not.toBeInTheDocument()
    })
  })
})
