import { MockedProvider } from '@apollo/client/testing'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { InMemoryCache } from '@apollo/client'
import { JourneyProvider } from '../../../../../libs/context'
import {
  GetJourney_journey as Journey,
  GetJourney_journey_blocks_ImageBlock as ImageBlock
} from '../../../../../../__generated__/GetJourney'
import {
  ImageEdit,
  BLOCK_DELETE_PRIMARY_IMAGE,
  PRIMARY_IMAGE_BLOCK_CREATE,
  PRIMARY_IMAGE_BLOCK_UPDATE,
  JOURNEY_PRIMARY_IMAGE_UPDATE
} from './ImageEdit'

describe('ImageEdit', () => {
  const image: ImageBlock = {
    id: 'image1.id',
    __typename: 'ImageBlock',
    parentBlockId: null,
    parentOrder: 0,
    src: 'https://example.com/image.jpg',
    alt: 'image.jpg',
    width: 1920,
    height: 1080,
    blurhash: ''
  }
  it('should disaply placeholder icon when no image set', () => {
    const { getAllByTestId } = render(
      <MockedProvider>
        <ImageEdit />
      </MockedProvider>
    )
    expect(getAllByTestId('ImageIcon')).toHaveLength(2)
  })

  it('should display the primaryImage', () => {
    const { getByTestId } = render(
      <MockedProvider>
        <JourneyProvider
          value={
            {
              primaryImageBlock: {
                src: 'img.src',
                alt: 'image.alt'
              }
            } as unknown as Journey
          }
        >
          <ImageEdit />
        </JourneyProvider>
      </MockedProvider>
    )
    expect(getByTestId('social-image')).toBeInTheDocument()
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

    const { getByRole } = render(
      <MockedProvider
        cache={cache}
        mocks={[
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
        <JourneyProvider value={{ id: 'journey.id' } as unknown as Journey}>
          <ImageEdit />
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button'))
    const textBox = getByRole('textbox')
    fireEvent.change(textBox, {
      target: { value: image.src }
    })
    fireEvent.blur(textBox)

    await waitFor(() => expect(imageBlockResult).toHaveBeenCalled())
    await waitFor(() => expect(journeyResult).toHaveBeenCalled())
    expect(cache.extract()['Journey:journey.id']?.blocks).toEqual([
      { __ref: 'ImageBlock:image1.id' }
    ])
  })

  it('update the primaryImage', async () => {
    const cache = new InMemoryCache()
    cache.restore({
      ['Journey:' + 'journey.id']: {
        blocks: [{ __ref: `ImageBlock:${image.id}` }],
        id: 'journey.id',
        __typename: 'Journey'
      },
      'ImageBlock:image1.id': {
        ...image
      }
    })

    const result = jest.fn(() => ({
      data: {
        imageBlockUpdate: {
          id: image.id,
          src: 'https://example.com/new-src.jpg',
          alt: 'new-src.jpg',
          __typename: 'ImageBlock',
          parentBlockId: null,
          width: image.width,
          height: image.height,
          parentOrder: image.parentOrder,
          blurhash: image.blurhash
        }
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        cache={cache}
        mocks={[
          {
            request: {
              query: PRIMARY_IMAGE_BLOCK_UPDATE,
              variables: {
                id: image.id,
                journeyId: 'journey.id',
                input: {
                  src: 'https://example.com/new-src.jpg',
                  alt: 'new-src.jpg'
                }
              }
            },
            result
          }
        ]}
      >
        <JourneyProvider
          value={
            {
              id: 'journey.id',
              primaryImageBlock: { ...image }
            } as unknown as Journey
          }
        >
          <ImageEdit />
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button'))
    const textBox = getByRole('textbox')
    fireEvent.change(textBox, {
      target: { value: 'https://example.com/new-src.jpg' }
    })
    fireEvent.blur(textBox)

    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(cache.extract()['ImageBlock:image1.id']).toEqual({
      ...image,
      src: 'https://example.com/new-src.jpg',
      alt: 'new-src.jpg'
    })
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
          value={
            {
              id: 'journey.id',
              primaryImageBlock: { ...image }
            } as unknown as Journey
          }
        >
          <ImageEdit />
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button'))
    fireEvent.click(getByTestId('DeleteOutlineIcon'))
    await waitFor(() => expect(imageDeleteResult).toHaveBeenCalled())
    await waitFor(() => expect(journeyUpdateResult).toHaveBeenCalled())
    expect(cache.extract()['Journey:journey.id']?.blocks).toEqual([])
  })
})
