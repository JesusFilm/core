import { render, fireEvent, waitFor } from '@testing-library/react'
import { InMemoryCache } from '@apollo/client'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { MockedProvider } from '@apollo/client/testing'
import {
  GetJourney_journey as Journey,
  GetJourney_journey_blocks_ImageBlock as ImageBlock
} from '../../../../../../__generated__/GetJourney'
import { createCloudflareUploadByUrlMock } from '../../../ImageLibrary/CustomImage/CustomUrl/data'
import {
  ImageEdit,
  BLOCK_DELETE_PRIMARY_IMAGE,
  PRIMARY_IMAGE_BLOCK_CREATE,
  JOURNEY_PRIMARY_IMAGE_UPDATE
} from './ImageEdit'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('ImageEdit', () => {
  const image: ImageBlock = {
    id: 'image1.id',
    __typename: 'ImageBlock',
    parentBlockId: null,
    parentOrder: 0,
    src: 'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/uploadId/public',
    alt: 'public',
    width: 1920,
    height: 1080,
    blurhash: ''
  }
  it('should disaply placeholder icon when no image set', () => {
    const { getAllByTestId } = render(
      <MockedProvider>
        <JourneyProvider
          value={{
            journey: { primaryImageBlockId: null } as unknown as Journey,
            admin: true
          }}
        >
          <ImageEdit />
        </JourneyProvider>
      </MockedProvider>
    )
    expect(getAllByTestId('ImageIcon')).toHaveLength(2)
  })

  it('should display the primaryImage', () => {
    const { getByRole } = render(
      <MockedProvider>
        <JourneyProvider
          value={{
            journey: {
              primaryImageBlock: {
                src: 'img.src',
                alt: 'image.alt'
              }
            } as unknown as Journey,
            admin: true
          }}
        >
          <ImageEdit />
        </JourneyProvider>
      </MockedProvider>
    )
    expect(getByRole('img')).toBeInTheDocument()
  })

  it('create the primaryImage', async () => {
    const cache = new InMemoryCache()
    cache.restore({
      ['Journey:' + 'journey.id']: {
        blocks: [],
        id: 'journey.id',
        __typename: 'Journey'
      }
    })

    const imageBlockResult = jest.fn(() => ({
      data: {
        imageBlockCreate: {
          __typename: 'ImageBlock',
          id: image.id,
          src: image.src,
          alt: image.alt,
          parentBlockId: image.parentBlockId,
          width: image.width,
          height: image.height,
          parentOrder: image.parentOrder,
          blurhash: image.blurhash
        }
      }
    }))

    const journeyResult = jest.fn(() => ({
      data: {
        journeyUpdate: {
          __typename: 'Journey',
          id: 'journey.id',
          primaryImageBlock: {
            id: image.id
          }
        }
      }
    }))

    const { getByRole, getByTestId } = render(
      <MockedProvider
        cache={cache}
        mocks={[
          createCloudflareUploadByUrlMock,
          {
            request: {
              query: PRIMARY_IMAGE_BLOCK_CREATE,
              variables: {
                input: {
                  journeyId: 'journey.id',
                  parentBlockId: 'journey.id',
                  src: image.src,
                  alt: image.alt
                }
              }
            },
            result: imageBlockResult
          },
          {
            request: {
              query: JOURNEY_PRIMARY_IMAGE_UPDATE,
              variables: {
                id: 'journey.id',
                input: {
                  primaryImageBlockId: image.id
                }
              }
            },
            result: journeyResult
          }
        ]}
      >
        <JourneyProvider
          value={{
            journey: { id: 'journey.id' } as unknown as Journey,
            admin: true
          }}
        >
          <ImageEdit />
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button'))
    expect(getByTestId('ImageLibrary')).toBeInTheDocument()
    fireEvent.click(getByRole('tab', { name: 'Custom' }))
    fireEvent.click(getByRole('button', { name: 'Add image by URL' }))
    const textBox = getByRole('textbox')
    fireEvent.change(textBox, {
      target: { value: 'https://example.com/image.jpg' }
    })
    fireEvent.blur(textBox)

    await waitFor(() => expect(getByRole('progressbar')).toBeInTheDocument())
    await waitFor(() => expect(imageBlockResult).toHaveBeenCalled())
    await waitFor(() => expect(journeyResult).toHaveBeenCalled())
    expect(cache.extract()['Journey:journey.id']?.blocks).toEqual([
      { __ref: 'ImageBlock:image1.id' }
    ])
  })

  it('delete the primaryImage', async () => {
    const cache = new InMemoryCache()
    cache.restore({
      ['Journey:' + 'journey.id']: {
        blocks: [{ __ref: `ImageBlock:${image.id}` }],
        id: 'journey.id',
        __typename: 'Journey',
        primaryImageBlock: {
          __ref: `ImageBlock:${image.id}`
        }
      },
      'ImageBlock:image1.id': {
        ...image
      }
    })

    const imageDeleteResult = jest.fn(() => ({
      data: {
        blockDelete: []
      }
    }))

    const journeyUpdateResult = jest.fn(() => ({
      data: {
        journeyUpdate: {
          __typename: 'Journey',
          id: 'journey.id',
          primaryImageBlock: {
            id: image.id
          }
        }
      }
    }))

    const { getByRole, getByTestId } = render(
      <MockedProvider
        cache={cache}
        mocks={[
          {
            request: {
              query: BLOCK_DELETE_PRIMARY_IMAGE,
              variables: {
                id: image.id,
                parentBlockId: null,
                journeyId: 'journey.id'
              }
            },
            result: imageDeleteResult
          },
          {
            request: {
              query: JOURNEY_PRIMARY_IMAGE_UPDATE,
              variables: {
                id: 'journey.id',
                input: {
                  primaryImageBlockId: null
                }
              }
            },
            result: journeyUpdateResult
          }
        ]}
      >
        <JourneyProvider
          value={{
            journey: {
              id: 'journey.id',
              primaryImageBlock: { ...image }
            } as unknown as Journey,
            admin: true
          }}
        >
          <ImageEdit />
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button'))
    expect(getByTestId('ImageLibrary')).toBeInTheDocument()
    fireEvent.click(getByTestId('imageBlockHeaderDelete'))
    await waitFor(() => expect(imageDeleteResult).toHaveBeenCalled())
    await waitFor(() => expect(journeyUpdateResult).toHaveBeenCalled())
    expect(cache.extract()['Journey:journey.id']?.blocks).toEqual([])
  })
})
