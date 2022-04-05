import { TreeBlock } from '@core/journeys/ui'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { InMemoryCache } from '@apollo/client'

import {
  GetJourney_journey as Journey,
  GetJourney_journey_blocks_CardBlock as CardBlock,
  GetJourney_journey_blocks_ImageBlock as ImageBlock,
  GetJourney_journey_blocks_VideoBlock as VideoBlock
} from '../../../../../../../../../__generated__/GetJourney'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../../../../../../../__generated__/globalTypes'
import { JourneyProvider } from '../../../../../../../../libs/context'
import {
  BackgroundMediaImage,
  CARD_BLOCK_COVER_IMAGE_BLOCK_CREATE,
  CARD_BLOCK_COVER_IMAGE_BLOCK_UPDATE,
  CARD_BLOCK_COVER_IMAGE_UPDATE,
  BLOCK_DELETE_FOR_BACKGROUND_IMAGE
} from './BackgroundMediaImage'

const journey: Journey = {
  __typename: 'Journey',
  id: 'journeyId',
  themeName: ThemeName.base,
  themeMode: ThemeMode.light,
  title: 'my journey',
  slug: 'my-journey',
  locale: 'en-US',
  description: 'my cool journey',
  status: JourneyStatus.draft,
  createdAt: '2021-11-19T12:34:56.647Z',
  publishedAt: null,
  blocks: [] as TreeBlock[],
  primaryImageBlock: null,
  userJourneys: []
}

const card: TreeBlock<CardBlock> = {
  id: 'card1.id',
  __typename: 'CardBlock',
  parentBlockId: 'step1.id',
  parentOrder: 0,
  coverBlockId: null,
  backgroundColor: null,
  themeMode: null,
  themeName: null,
  fullscreen: false,
  children: []
}
const image: TreeBlock<ImageBlock> = {
  id: 'image1.id',
  __typename: 'ImageBlock',
  parentBlockId: card.id,
  parentOrder: 0,
  src: 'https://example.com/image.jpg',
  alt: 'image.jpg',
  width: 1920,
  height: 1080,
  blurhash: '',
  children: []
}

describe('BackgroundMediaImage', () => {
  it('creates a new image cover block', async () => {
    const cache = new InMemoryCache()
    cache.restore({
      ['Journey:' + journey.id]: {
        blocks: [{ __ref: `CardBlock:${card.id}` }],
        id: journey.id,
        __typename: 'Journey'
      }
    })
    const cardBlockResult = jest.fn(() => ({
      data: {
        cardBlockUpdate: {
          id: card.id,
          coverBlockId: image.id,
          __typename: 'CardBlock'
        }
      }
    }))
    const imageBlockResult = jest.fn(() => ({
      data: {
        imageBlockCreate: {
          id: image.id,
          src: image.src,
          alt: image.alt,
          __typename: 'ImageBlock',
          parentBlockId: card.id,
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
              query: CARD_BLOCK_COVER_IMAGE_BLOCK_CREATE,
              variables: {
                input: {
                  journeyId: journey.id,
                  parentBlockId: card.id,
                  src: image.src,
                  alt: image.alt
                }
              }
            },
            result: imageBlockResult
          },
          {
            request: {
              query: CARD_BLOCK_COVER_IMAGE_UPDATE,
              variables: {
                id: card.id,
                journeyId: journey.id,
                input: {
                  coverBlockId: image.id
                }
              }
            },
            result: cardBlockResult
          }
        ]}
      >
        <JourneyProvider value={journey}>
          <BackgroundMediaImage cardBlock={card} />
        </JourneyProvider>
      </MockedProvider>
    )
    const textBox = await getByRole('textbox')
    fireEvent.change(textBox, {
      target: { value: image.src }
    })
    fireEvent.blur(textBox)
    await waitFor(() => expect(imageBlockResult).toHaveBeenCalled())
    await waitFor(() => expect(cardBlockResult).toHaveBeenCalled())
    expect(cache.extract()[`Journey:${journey.id}`]?.blocks).toEqual([
      { __ref: `CardBlock:${card.id}` },
      { __ref: `ImageBlock:${image.id}` }
    ])
  })

  it('replaces a video cover block', async () => {
    const video: TreeBlock<VideoBlock> = {
      id: 'video1.id',
      __typename: 'VideoBlock',
      parentBlockId: 'card1.id',
      parentOrder: 0,
      startAt: 0,
      endAt: null,
      muted: false,
      autoplay: true,
      fullsize: true,
      videoId: '2_0-FallingPlates',
      videoVariantLanguageId: '529',
      video: {
        __typename: 'Video',
        id: '2_0-FallingPlates',
        variant: {
          __typename: 'VideoVariant',
          id: '2_0-FallingPlates-529',
          hls: 'https://arc.gt/hls/2_0-FallingPlates/529'
        }
      },
      posterBlockId: 'poster1.id',
      children: []
    }

    const videoCard: TreeBlock<CardBlock> = {
      ...card,
      coverBlockId: video.id,
      children: [video]
    }
    const cache = new InMemoryCache()
    cache.restore({
      ['Journey:' + journey.id]: {
        blocks: [{ __ref: `CardBlock:${card.id}` }],
        id: journey.id,
        __typename: 'Journey'
      }
    })
    const cardBlockResult = jest.fn(() => ({
      data: {
        cardBlockUpdate: {
          id: card.id,
          coverBlockId: image.id,
          __typename: 'CardBlock'
        }
      }
    }))
    const imageBlockResult = jest.fn(() => ({
      data: {
        imageBlockCreate: {
          id: image.id,
          src: image.src,
          alt: image.alt,
          __typename: 'ImageBlock',
          parentBlockId: card.id,
          width: image.width,
          height: image.height,
          parentOrder: image.parentOrder,
          blurhash: image.blurhash
        }
      }
    }))
    const blockDeleteResult = jest.fn(() => ({
      data: {
        blockDelete: []
      }
    }))
    const { getByRole } = render(
      <MockedProvider
        cache={cache}
        mocks={[
          {
            request: {
              query: BLOCK_DELETE_FOR_BACKGROUND_IMAGE,
              variables: {
                id: video.id,
                parentBlockId: card.parentBlockId,
                journeyId: journey.id
              }
            },
            result: blockDeleteResult
          },
          {
            request: {
              query: CARD_BLOCK_COVER_IMAGE_UPDATE,
              variables: {
                id: card.id,
                journeyId: journey.id,
                input: {
                  coverBlockId: null
                }
              }
            },
            result: cardBlockResult
          },
          {
            request: {
              query: CARD_BLOCK_COVER_IMAGE_BLOCK_CREATE,
              variables: {
                input: {
                  journeyId: journey.id,
                  parentBlockId: card.id,
                  src: image.src,
                  alt: image.alt
                }
              }
            },
            result: imageBlockResult
          },
          {
            request: {
              query: CARD_BLOCK_COVER_IMAGE_UPDATE,
              variables: {
                id: card.id,
                journeyId: journey.id,
                input: {
                  coverBlockId: image.id
                }
              }
            },
            result: cardBlockResult
          }
        ]}
      >
        <JourneyProvider value={journey}>
          <BackgroundMediaImage cardBlock={videoCard} />
        </JourneyProvider>
      </MockedProvider>
    )
    const textBox = await getByRole('textbox')
    fireEvent.change(textBox, {
      target: { value: image.src }
    })
    fireEvent.blur(textBox)
    await waitFor(() => expect(imageBlockResult).toHaveBeenCalled())
    await waitFor(() => expect(cardBlockResult).toHaveBeenCalled())
    expect(cache.extract()[`Journey:${journey.id}`]?.blocks).toEqual([
      { __ref: `CardBlock:${card.id}` },
      { __ref: `ImageBlock:${image.id}` }
    ])
  })

  describe('Existing image cover', () => {
    const existingCoverBlock: TreeBlock<CardBlock> = {
      ...card,
      coverBlockId: image.id,
      children: [
        {
          ...image,
          src: 'https://example.com/image2.jpg',
          alt: 'https://example.com/image2.jpg'
        }
      ]
    }

    it('updates image cover block', async () => {
      const cache = new InMemoryCache()
      cache.restore({
        ['Journey:' + journey.id]: {
          blocks: [
            { __ref: `CardBlock:${card.id}` },
            { __ref: `ImageBlock:${image.id}` }
          ],
          id: journey.id,
          __typename: 'Journey'
        }
      })
      const imageBlockResult = jest.fn(() => ({
        data: {
          imageBlockUpdate: {
            id: image.id,
            src: image.src,
            alt: image.alt,
            __typename: 'ImageBlock',
            parentBlockId: card.id,
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
                query: CARD_BLOCK_COVER_IMAGE_BLOCK_UPDATE,
                variables: {
                  id: image.id,
                  journeyId: journey.id,
                  input: {
                    src: image.src,
                    alt: image.alt
                  }
                }
              },
              result: imageBlockResult
            }
          ]}
        >
          <JourneyProvider value={journey}>
            <BackgroundMediaImage cardBlock={existingCoverBlock} />
          </JourneyProvider>
        </MockedProvider>
      )
      const textBox = await getByRole('textbox')
      fireEvent.change(textBox, {
        target: { value: image.src }
      })
      fireEvent.blur(textBox)
      await waitFor(() => expect(imageBlockResult).toHaveBeenCalled())
      await waitFor(() => expect(textBox).toHaveValue(image.src))
      expect(cache.extract()[`Journey:${journey.id}`]?.blocks).toEqual([
        { __ref: `CardBlock:${card.id}` },
        { __ref: `ImageBlock:${image.id}` }
      ])
    })
    it('deletes an image block', async () => {
      const cache = new InMemoryCache()
      cache.restore({
        ['Journey:' + journey.id]: {
          blocks: [
            { __ref: `CardBlock:${card.id}` },
            { __ref: `ImageBlock:${image.id}` }
          ],
          id: journey.id,
          __typename: 'Journey'
        },
        ['ImageBlock:' + image.id]: { ...image }
      })
      const cardBlockResult = jest.fn(() => ({
        data: {
          cardBlockUpdate: {
            id: card.id,
            coverBlockId: null,
            __typename: 'CardBlock'
          }
        }
      }))
      const blockDeleteResult = jest.fn(() => ({
        data: {
          blockDelete: []
        }
      }))
      const { getByTestId } = render(
        <MockedProvider
          cache={cache}
          mocks={[
            {
              request: {
                query: BLOCK_DELETE_FOR_BACKGROUND_IMAGE,
                variables: {
                  id: image.id,
                  parentBlockId: card.parentBlockId,
                  journeyId: journey.id
                }
              },
              result: blockDeleteResult
            },
            {
              request: {
                query: CARD_BLOCK_COVER_IMAGE_UPDATE,
                variables: {
                  id: card.id,
                  journeyId: journey.id,
                  input: {
                    coverBlockId: null
                  }
                }
              },
              result: cardBlockResult
            }
          ]}
        >
          <JourneyProvider value={journey}>
            <BackgroundMediaImage cardBlock={existingCoverBlock} />
          </JourneyProvider>
        </MockedProvider>
      )
      const button = await getByTestId('imageBlockHeaderDelete')
      fireEvent.click(button)
      await waitFor(() => expect(cardBlockResult).toHaveBeenCalled())
      expect(blockDeleteResult).toHaveBeenCalled()
      expect(cache.extract()[`Journey:${journey.id}`]?.blocks).toEqual([
        { __ref: `CardBlock:${card.id}` }
      ])
      expect(cache.extract()['ImageBlock:' + image.id]).toBeUndefined()
    })
  })
})
