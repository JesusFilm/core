import { MockedProvider } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SnackbarProvider } from 'notistack'

import {
  GetJourney_journey_blocks_ImageBlock as ImageBlock,
  GetJourney_journey as Journey
} from '../../../../../../../../__generated__/GetJourney'
import { CREATE_CLOUDFLARE_UPLOAD_BY_FILE } from '../../../../../../../libs/useCloudflareUploadByFileMutation/useCloudflareUploadByFileMutation'

import { IMAGE_BLOCK_UPDATE, ImagesSection } from './ImagesSection'

jest.mock('next-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

const mockEnqueueSnackbar = jest.fn()
jest.mock('notistack', () => ({
  ...jest.requireActual('notistack'),
  useSnackbar: () => ({ enqueueSnackbar: mockEnqueueSnackbar })
}))

describe('ImagesSection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const imageBlock: ImageBlock = {
    id: 'image1.id',
    __typename: 'ImageBlock',
    parentBlockId: 'card1.id',
    parentOrder: 0,
    src: 'https://example.com/image.jpg',
    alt: 'image',
    width: 100,
    height: 100,
    blurhash: '',
    customizable: true,
    scale: null,
    focalTop: null,
    focalLeft: null
  }

  const journey = {
    id: 'journey.id',
    blocks: [imageBlock]
  } as unknown as Journey

  it('should render the section title and display empty message when no blocks found', () => {
    render(
      <MockedProvider>
        <SnackbarProvider>
          <ImagesSection journey={null} cardBlockId={null} />
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(screen.getByText('Image')).toBeInTheDocument()
    expect(
      screen.getByText('No customizable images found for this card.')
    ).toBeInTheDocument()
  })

  it('should display empty message when cardBlockId is null with a non-null journey', () => {
    render(
      <MockedProvider>
        <SnackbarProvider>
          <ImagesSection journey={journey} cardBlockId={null} />
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(
      screen.getByText('No customizable images found for this card.')
    ).toBeInTheDocument()
  })

  it('should display empty message when journey has blocks but none match the filter', () => {
    const nonMatchingJourney = {
      ...journey,
      blocks: [
        {
          ...imageBlock,
          id: 'otherImage.id',
          parentBlockId: 'otherCard.id'
        }
      ]
    } as unknown as Journey

    render(
      <MockedProvider>
        <SnackbarProvider>
          <ImagesSection journey={nonMatchingJourney} cardBlockId="card1.id" />
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(
      screen.getByText('No customizable images found for this card.')
    ).toBeInTheDocument()
  })

  it('should render multiple ImageSectionItem components for the same card', () => {
    const multipleImagesJourney = {
      ...journey,
      blocks: [
        imageBlock,
        {
          ...imageBlock,
          id: 'image2.id'
        }
      ]
    } as unknown as Journey

    render(
      <MockedProvider>
        <SnackbarProvider>
          <ImagesSection
            journey={multipleImagesJourney}
            cardBlockId="card1.id"
          />
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(screen.getAllByRole('button', { name: 'Edit image' })).toHaveLength(
      2
    )
    expect(
      screen.getByTestId('ImagesSection-file-input-image1.id')
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('ImagesSection-file-input-image2.id')
    ).toBeInTheDocument()
  })

  it('should call imageBlockUpdate mutation when handleUploadComplete is triggered', async () => {
    const originalEnv = process.env
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_CLOUDFLARE_UPLOAD_KEY: ''
    }
    const originalFetch = global.fetch

    const cloudflareResult = jest.fn().mockReturnValue({
      data: {
        createCloudflareUploadByFile: {
          uploadUrl: 'https://example.com/upload',
          id: 'cloudflare.id',
          __typename: 'CloudflareUploadByFile'
        }
      }
    })
    const updateResult = jest.fn().mockReturnValue({
      data: {
        imageBlockUpdate: {
          id: 'image1.id',
          src: 'https://imagedelivery.net//cloudflare.id/public',
          alt: 'image',
          blurhash: '',
          width: 100,
          height: 100,
          scale: 100,
          focalTop: 50,
          focalLeft: 50,
          __typename: 'ImageBlock'
        }
      }
    })

    const mocks = [
      {
        request: {
          query: CREATE_CLOUDFLARE_UPLOAD_BY_FILE
        },
        result: cloudflareResult
      },
      {
        request: {
          query: IMAGE_BLOCK_UPDATE,
          variables: {
            id: 'image1.id',
            input: {
              src: 'https://imagedelivery.net//cloudflare.id/public',
              scale: 100,
              focalLeft: 50,
              focalTop: 50
            }
          }
        },
        result: updateResult
      }
    ]

    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        success: true,
        result: { id: 'cloudflare.id' }
      })
    })

    const user = userEvent.setup()
    render(
      <MockedProvider mocks={mocks}>
        <SnackbarProvider>
          <ImagesSection journey={journey} cardBlockId="card1.id" />
        </SnackbarProvider>
      </MockedProvider>
    )

    const file = new File([''], 'test.jpg', { type: 'image/jpeg' })
    const input = screen.getByTestId('ImagesSection-file-input-image1.id')
    await user.upload(input, file)

    await waitFor(() => expect(updateResult).toHaveBeenCalled(), { timeout: 3000 })

    await waitFor(
      () => {
        expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
          'File uploaded successfully',
          { variant: 'success' }
        )
      },
      { timeout: 3000 }
    )

    process.env = originalEnv
    global.fetch = originalFetch
  })

  it('should show error snackbar when imageBlockUpdate mutation fails', async () => {
    const originalEnv = process.env
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_CLOUDFLARE_UPLOAD_KEY: ''
    }
    const originalFetch = global.fetch

    const cloudflareResult = jest.fn().mockReturnValue({
      data: {
        createCloudflareUploadByFile: {
          uploadUrl: 'https://example.com/upload',
          id: 'cloudflare.id',
          __typename: 'CloudflareUploadByFile'
        }
      }
    })

    const mocks = [
      {
        request: {
          query: CREATE_CLOUDFLARE_UPLOAD_BY_FILE
        },
        result: cloudflareResult
      },
      {
        request: {
          query: IMAGE_BLOCK_UPDATE,
          variables: {
            id: 'image1.id',
            input: {
              src: 'https://imagedelivery.net//cloudflare.id/public',
              scale: 100,
              focalLeft: 50,
              focalTop: 50
            }
          }
        },
        error: new Error('Mutation failed')
      }
    ]

    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        success: true,
        result: { id: 'cloudflare.id' }
      })
    })

    const user = userEvent.setup()
    render(
      <MockedProvider mocks={mocks}>
        <SnackbarProvider>
          <ImagesSection journey={journey} cardBlockId="card1.id" />
        </SnackbarProvider>
      </MockedProvider>
    )

    const file = new File([''], 'test.jpg', { type: 'image/jpeg' })
    const input = screen.getByTestId('ImagesSection-file-input-image1.id')
    await user.upload(input, file)

    await waitFor(
      () => {
        expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
          'Upload failed. Please try again',
          { variant: 'error' }
        )
      },
      { timeout: 3000 }
    )

    process.env = originalEnv
    global.fetch = originalFetch
  })

  it('should filter blocks based on cardBlockId and customizable flag', () => {
    const otherCardImage: ImageBlock = {
      ...imageBlock,
      id: 'image2.id',
      parentBlockId: 'otherCard.id'
    }
    const nonCustomizableImage: ImageBlock = {
      ...imageBlock,
      id: 'image3.id',
      customizable: false
    }
    const filteredJourney = {
      id: 'journey.id',
      blocks: [imageBlock, otherCardImage, nonCustomizableImage]
    } as unknown as Journey

    render(
      <MockedProvider>
        <SnackbarProvider>
          <ImagesSection journey={filteredJourney} cardBlockId="card1.id" />
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(
      screen.getByTestId('ImagesSection-file-input-image1.id')
    ).toBeInTheDocument()
    expect(
      screen.queryByTestId('ImagesSection-file-input-image2.id')
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId('ImagesSection-file-input-image3.id')
    ).not.toBeInTheDocument()
  })
})
