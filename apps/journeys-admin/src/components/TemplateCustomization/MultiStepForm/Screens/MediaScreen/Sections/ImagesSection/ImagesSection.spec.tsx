import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import {
  GetJourney_journey as Journey,
  GetJourney_journey_blocks_ImageBlock as ImageBlock
} from '../../../../../../../../__generated__/GetJourney'
import { CREATE_CLOUDFLARE_UPLOAD_BY_FILE } from '../../../../../../../libs/useCloudflareUploadByFileMutation/useCloudflareUploadByFileMutation'

import { IMAGE_BLOCK_UPDATE, ImagesSection } from './ImagesSection'

describe('ImagesSection', () => {
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

  it('should render the section title', () => {
    render(
      <MockedProvider>
        <ImagesSection journey={null} cardBlockId={null} />
      </MockedProvider>
    )
    expect(screen.getByText('Image')).toBeInTheDocument()
  })

  it('should display a message when no customizable image blocks are found', () => {
    render(
      <MockedProvider>
        <ImagesSection journey={null} cardBlockId={null} />
      </MockedProvider>
    )
    expect(
      screen.getByText('No customizable images found for this card.')
    )
  })

  it('should render a list of ImageSectionItem components for each matching image block', () => {
    render(
      <MockedProvider>
        <ImagesSection journey={journey} cardBlockId="card1.id" />
      </MockedProvider>
    )
    expect(screen.getByRole('button', { name: 'Edit image' })).toBeInTheDocument()
  })

  it('should call imageBlockUpdate mutation when handleUploadComplete is triggered', async () => {
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

    render(
      <MockedProvider mocks={mocks}>
        <ImagesSection journey={journey} cardBlockId="card1.id" />
      </MockedProvider>
    )

    const file = new File([''], 'test.jpg', { type: 'image/jpeg' })
    const input = screen.getByTestId('ImagesSection-file-input-image1.id')
    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => expect(updateResult).toHaveBeenCalled())
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
        <ImagesSection journey={filteredJourney} cardBlockId="card1.id" />
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
