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
  CARD_BLOCK_COVER_IMAGE_UPDATE
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

describe('BackgroundMediaImage', () => {
  describe('No existing cover', () => {
    it('shows placeholders on null', () => {
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
      const { getByTestId } = render(
        <MockedProvider>
          <JourneyProvider value={journey}>
            <BackgroundMediaImage cardBlock={card} />
          </JourneyProvider>
        </MockedProvider>
      )
      expect(getByTestId('imagePlaceholderStack')).toBeInTheDocument()
    })

    it('creates a new image cover block', async () => {
      const cache = new InMemoryCache()
      cache.restore({
        'Journey:journeyId': {
          blocks: [{ __ref: 'CardBlock:card1.id' }],
          id: 'journeyId',
          __typename: 'Journey'
        }
      })

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
        parentBlockId: '3',
        parentOrder: 0,
        src: 'https://example.com/image.jpg',
        alt: 'random image from unsplash',
        width: 1920,
        height: 1080,
        blurhash: '',
        children: []
      }
      const cardBlockResult = jest.fn(() => ({
        data: {
          block: { id: card.id, coverBlockId: 'image1.id' }
        }
      }))
      const imageBlockResult = jest.fn(() => ({
        data: {
          block: image
        }
      }))
      const { getByLabelText } = render(
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
                    src: 'https://example.com/image.jpg',
                    alt: 'https://example.com/image.jpg' // per Vlad 26/1/22, we are hardcoding the image alt for now
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
                    coverBlockId: 'image1.id'
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
      const textBox = getByLabelText(/^Paste URL of image\.\.\./i)
      fireEvent.change(textBox, {
        target: { value: 'https://example.com/image.jpg' }
      })
      await waitFor(() => expect(imageBlockResult).toHaveBeenCalled(), {
        timeout: 2000
      })
      await waitFor(() => expect(cardBlockResult).toHaveBeenCalled(), {
        timeout: 2000
      })
    })
  })
  describe('Video Cover Block', () => {
    it('shows placeholders on VideoBlock', () => {
      const videoBlock: TreeBlock<VideoBlock> = {
        id: 'video1.id',
        __typename: 'VideoBlock',
        parentBlockId: 'card1.id',
        parentOrder: 0,
        title: 'my video',
        startAt: 0,
        endAt: null,
        muted: false,
        autoplay: true,
        videoContent: {
          __typename: 'VideoGeneric',
          src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        },
        posterBlockId: 'poster1.id',
        children: []
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
        children: [videoBlock]
      }
      const { getByTestId } = render(
        <MockedProvider>
          <JourneyProvider value={journey}>
            <BackgroundMediaImage cardBlock={card} />
          </JourneyProvider>
        </MockedProvider>
      )
      expect(getByTestId('imagePlaceholderStack')).toBeInTheDocument()
    })
  })
})
