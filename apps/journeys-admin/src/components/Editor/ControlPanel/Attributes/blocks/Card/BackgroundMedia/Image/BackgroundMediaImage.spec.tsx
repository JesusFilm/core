import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import useMediaQuery from '@mui/material/useMediaQuery'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import type { TreeBlock } from '@core/journeys/ui/block'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import {
  GetJourney_journey_blocks_CardBlock as CardBlock,
  GetJourney_journey_blocks_ImageBlock as ImageBlock,
  GetJourney_journey as Journey,
  GetJourney_journey_blocks_VideoBlock as VideoBlock
} from '../../../../../../../../../__generated__/GetJourney'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName,
  VideoBlockSource
} from '../../../../../../../../../__generated__/globalTypes'
import { createCloudflareUploadByUrlMock } from '../../../../../../ImageBlockEditor/CustomImage/CustomUrl/data'

import {
  BLOCK_DELETE_FOR_BACKGROUND_IMAGE,
  BackgroundMediaImage,
  CARD_BLOCK_COVER_IMAGE_BLOCK_CREATE,
  CARD_BLOCK_COVER_IMAGE_BLOCK_UPDATE
} from './BackgroundMediaImage'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

const journey: Journey = {
  __typename: 'Journey',
  id: 'journeyId',
  themeName: ThemeName.base,
  themeMode: ThemeMode.light,
  strategySlug: null,
  featuredAt: null,
  title: 'my journey',
  slug: 'my-journey',
  language: {
    __typename: 'Language',
    id: '529',
    bcp47: 'en',
    iso3: 'eng',
    name: [
      {
        __typename: 'Translation',
        value: 'English',
        primary: true
      }
    ]
  },
  description: 'my cool journey',
  status: JourneyStatus.draft,
  createdAt: '2021-11-19T12:34:56.647Z',
  publishedAt: null,
  blocks: [] as TreeBlock[],
  primaryImageBlock: null,
  userJourneys: [],
  template: null,
  seoTitle: null,
  seoDescription: null,
  chatButtons: [],
  host: null,
  team: null
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
  src: 'https://imagedelivery.net/cloudflare-key/uploadId/public',
  alt: 'public',
  width: 1920,
  height: 1080,
  blurhash: '',
  children: []
}

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
  action: null,
  videoId: '2_0-FallingPlates',
  videoVariantLanguageId: '529',
  source: VideoBlockSource.internal,
  title: null,
  description: null,
  duration: null,
  image: null,
  objectFit: null,
  video: {
    __typename: 'Video',
    id: '2_0-FallingPlates',
    title: [
      {
        __typename: 'Translation',
        value: 'FallingPlates'
      }
    ],
    image:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_0-FallingPlates.mobileCinematicHigh.jpg',
    variant: {
      __typename: 'VideoVariant',
      id: '2_0-FallingPlates-529',
      hls: 'https://arc.gt/hls/2_0-FallingPlates/529'
    }
  },
  posterBlockId: null,
  children: []
}

describe('BackgroundMediaImage', () => {
  beforeEach(() => (useMediaQuery as jest.Mock).mockImplementation(() => true))

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
  })

  it('creates a new image cover block', async () => {
    const cache = new InMemoryCache()
    cache.restore({
      ['Journey:' + journey.id]: {
        blocks: [{ __ref: `CardBlock:${card.id}` }],
        id: journey.id,
        __typename: 'Journey'
      },
      [`CardBlock:${card.id}`]: { ...card }
    })
    const imageBlockResult = jest.fn(() => ({
      data: {
        imageBlockCreate: image
      }
    }))
    const { getByRole } = render(
      <MockedProvider
        cache={cache}
        mocks={[
          createCloudflareUploadByUrlMock,
          {
            request: {
              query: CARD_BLOCK_COVER_IMAGE_BLOCK_CREATE,
              variables: {
                input: {
                  journeyId: journey.id,
                  parentBlockId: card.id,
                  src: image.src,
                  alt: image.alt,
                  isCover: true
                }
              }
            },
            result: imageBlockResult
          }
        ]}
      >
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <SnackbarProvider>
            <BackgroundMediaImage cardBlock={card} />
          </SnackbarProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Select Image' }))
    fireEvent.click(getByRole('tab', { name: 'Custom' }))
    fireEvent.click(getByRole('button', { name: 'Add image by URL' }))
    const textBox = await getByRole('textbox')
    fireEvent.change(textBox, {
      target: { value: 'https://example.com/image.jpg' }
    })
    fireEvent.blur(textBox)
    await waitFor(() => expect(imageBlockResult).toHaveBeenCalled())
    expect(cache.extract()[`Journey:${journey.id}`]?.blocks).toEqual([
      { __ref: `CardBlock:${card.id}` },
      { __ref: `ImageBlock:${image.id}` }
    ])
    expect(cache.extract()[`CardBlock:${card.id}`]?.coverBlockId).toEqual(
      image.id
    )
  })

  it('replaces a video cover block', async () => {
    const videoCard: TreeBlock<CardBlock> = {
      ...card,
      coverBlockId: video.id,
      children: [video]
    }
    const cache = new InMemoryCache()
    cache.restore({
      ['Journey:' + journey.id]: {
        blocks: [
          { __ref: `CardBlock:${card.id}` },
          { __ref: `VideoBlock:${video.id}` }
        ],
        id: journey.id,
        __typename: 'Journey'
      },
      [`CardBlock:${card.id}`]: { ...card, coverBlockId: video.id }
    })
    const videoBlockDeleteResult = jest.fn(() => ({
      data: {
        blockDelete: []
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
          createCloudflareUploadByUrlMock,
          {
            request: {
              query: BLOCK_DELETE_FOR_BACKGROUND_IMAGE,
              variables: {
                id: video.id,
                parentBlockId: card.parentBlockId,
                journeyId: journey.id
              }
            },
            result: videoBlockDeleteResult
          },
          {
            request: {
              query: CARD_BLOCK_COVER_IMAGE_BLOCK_CREATE,
              variables: {
                input: {
                  journeyId: journey.id,
                  parentBlockId: card.id,
                  src: image.src,
                  alt: image.alt,
                  isCover: true
                }
              }
            },
            result: imageBlockResult
          }
        ]}
      >
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <SnackbarProvider>
            <BackgroundMediaImage cardBlock={videoCard} />
          </SnackbarProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Select Image' }))
    fireEvent.click(getByRole('tab', { name: 'Custom' }))
    fireEvent.click(getByRole('button', { name: 'Add image by URL' }))
    const textBox = await getByRole('textbox')
    fireEvent.change(textBox, {
      target: { value: 'https://example.com/image.jpg' }
    })
    fireEvent.blur(textBox)

    await waitFor(() => expect(videoBlockDeleteResult).toHaveBeenCalled())
    await waitFor(() => expect(imageBlockResult).toHaveBeenCalled())
    expect(cache.extract()[`Journey:${journey.id}`]?.blocks).toEqual([
      { __ref: `CardBlock:${card.id}` },
      { __ref: `ImageBlock:${image.id}` }
    ])
    expect(cache.extract()[`CardBlock:${card.id}`]?.coverBlockId).toEqual(
      image.id
    )
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
            parentOrder: image.parentOrder
          }
        }
      }))
      const { getByRole } = render(
        <MockedProvider
          cache={cache}
          mocks={[
            createCloudflareUploadByUrlMock,
            {
              request: {
                query: CARD_BLOCK_COVER_IMAGE_BLOCK_UPDATE,
                variables: {
                  id: image.id,
                  journeyId: journey.id,
                  input: {
                    src: image.src,
                    alt: image.alt,
                    blurhash: undefined,
                    width: 1920,
                    height: 1080
                  }
                }
              },
              result: imageBlockResult
            }
          ]}
        >
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            <SnackbarProvider>
              <BackgroundMediaImage cardBlock={existingCoverBlock} />
            </SnackbarProvider>
          </JourneyProvider>
        </MockedProvider>
      )
      fireEvent.click(
        getByRole('button', {
          name: 'https://example.com/image2.jpg Selected Image 1920 x 1080 pixels'
        })
      )
      fireEvent.click(getByRole('tab', { name: 'Custom' }))
      fireEvent.click(getByRole('button', { name: 'Add image by URL' }))
      const textBox = await getByRole('textbox')
      fireEvent.change(textBox, {
        target: { value: 'https://example.com/image.jpg' }
      })
      fireEvent.blur(textBox)
      await waitFor(() => expect(imageBlockResult).toHaveBeenCalled())
      expect(cache.extract()[`Journey:${journey.id}`]?.blocks).toEqual([
        { __ref: `CardBlock:${card.id}` },
        { __ref: `ImageBlock:${image.id}` }
      ])
    })

    it('shows loading icon', async () => {
      const { getByRole } = render(
        <MockedProvider mocks={[createCloudflareUploadByUrlMock]}>
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            <SnackbarProvider>
              <BackgroundMediaImage cardBlock={existingCoverBlock} />
            </SnackbarProvider>
          </JourneyProvider>
        </MockedProvider>
      )
      fireEvent.click(
        getByRole('button', {
          name: 'https://example.com/image2.jpg Selected Image 1920 x 1080 pixels'
        })
      )
      fireEvent.click(getByRole('tab', { name: 'Custom' }))
      fireEvent.click(getByRole('button', { name: 'Add image by URL' }))
      const textbox = getByRole('textbox')
      fireEvent.change(textbox, {
        target: { value: 'https://example.com/image.jpg' }
      })
      fireEvent.blur(textbox)
      await waitFor(() => expect(getByRole('progressbar')).toBeInTheDocument())
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
      const blockDeleteResult = jest.fn(() => ({
        data: {
          blockDelete: []
        }
      }))
      const { getByRole, getByTestId } = render(
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
            }
          ]}
        >
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            <SnackbarProvider>
              <BackgroundMediaImage cardBlock={existingCoverBlock} />
            </SnackbarProvider>
          </JourneyProvider>
        </MockedProvider>
      )
      fireEvent.click(
        getByRole('button', {
          name: 'https://example.com/image2.jpg Selected Image 1920 x 1080 pixels'
        })
      )
      const button = await getByTestId('imageBlockHeaderDelete')
      fireEvent.click(button)
      await waitFor(() => expect(blockDeleteResult).toHaveBeenCalled())
      expect(cache.extract()[`Journey:${journey.id}`]?.blocks).toEqual([
        { __ref: `CardBlock:${card.id}` }
      ])
      expect(cache.extract()['ImageBlock:' + image.id]).toBeUndefined()
    })
  })
})
