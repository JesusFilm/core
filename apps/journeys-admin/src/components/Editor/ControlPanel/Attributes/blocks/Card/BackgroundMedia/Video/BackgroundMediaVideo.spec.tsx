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
  BackgroundMediaVideo,
  CARD_BLOCK_COVER_VIDEO_BLOCK_CREATE,
  CARD_BLOCK_COVER_VIDEO_BLOCK_UPDATE,
  CARD_BLOCK_COVER_VIDEO_UPDATE,
  BLOCK_DELETE_FOR_BACKGROUND_VIDEO
} from './BackgroundMediaVideo'

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

const video: TreeBlock<VideoBlock> = {
  id: 'video1.id',
  __typename: 'VideoBlock',
  parentBlockId: 'card1.id',
  parentOrder: 0,
  title: 'watch',
  startAt: 0,
  endAt: null,
  muted: true,
  autoplay: true,
  fullsize: true,
  videoContent: {
    __typename: 'VideoGeneric',
    src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  },
  posterBlockId: null,
  children: []
}

describe('BackgroundMediaVideo', () => {
  describe('No existing cover', () => {
    it('shows placeholders on null', () => {
      const { getByTestId } = render(
        <MockedProvider>
          <JourneyProvider value={journey}>
            <BackgroundMediaVideo cardBlock={card} />
          </JourneyProvider>
        </MockedProvider>
      )
      expect(getByTestId('videoPlaceholderStack')).toBeInTheDocument()
    })

    it('creates a new video cover block', async () => {
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
            coverBlockId: video.id,
            __typename: 'CardBlock'
          }
        }
      }))
      const videoBlockResult = jest.fn(() => ({
        data: {
          videoBlockCreate: {
            id: video.id,
            title: video.title,
            startAt: video.startAt,
            endAt: video.endAt,
            muted: video.muted,
            autoplay: video.autoplay,
            posterBlockId: video.posterBlockId,
            videoContent: video.videoContent,
            __typename: 'VideoBlock'
          }
        }
      }))
      const { getByRole } = render(
        <MockedProvider
          cache={cache}
          mocks={[
            {
              request: {
                query: CARD_BLOCK_COVER_VIDEO_BLOCK_CREATE,
                variables: {
                  input: {
                    journeyId: journey.id,
                    parentBlockId: card.id,
                    title: video.title,
                    startAt: video.startAt,
                    endAt: video.endAt,
                    muted: video.muted,
                    autoplay: video.autoplay,
                    posterBlockId: video.posterBlockId,
                    videoContent: { src: video.videoContent.src }
                  }
                }
              },
              result: videoBlockResult
            },
            {
              request: {
                query: CARD_BLOCK_COVER_VIDEO_UPDATE,
                variables: {
                  id: card.id,
                  journeyId: journey.id,
                  input: {
                    coverBlockId: video.id
                  }
                }
              },
              result: cardBlockResult
            }
          ]}
        >
          <JourneyProvider value={journey}>
            <BackgroundMediaVideo cardBlock={card} debounceTime={0} />
          </JourneyProvider>
        </MockedProvider>
      )
      const textBox = await getByRole('textbox')
      fireEvent.change(textBox, {
        target: { value: video.videoContent.src }
      })
      await waitFor(() => expect(videoBlockResult).toHaveBeenCalled())
      await waitFor(() => expect(cardBlockResult).toHaveBeenCalled())
      expect(cache.extract()[`Journey:${journey.id}`]?.blocks).toEqual([
        { __ref: `CardBlock:${card.id}` },
        { __ref: `VideoBlock:${video.id}` }
      ])
    })
  })
  describe('Image Cover Block', () => {
    const image: TreeBlock<ImageBlock> = {
      id: 'image1.id',
      __typename: 'ImageBlock',
      parentBlockId: card.id,
      parentOrder: 0,
      src: 'https://example.com/image.jpg',
      alt: 'https://example.com/image.jpg',
      width: 1920,
      height: 1080,
      blurhash: '',
      children: []
    }
    const videoCard: TreeBlock<CardBlock> = {
      ...card,
      coverBlockId: image.id,
      children: [image]
    }
    it('shows placeholders on ImageBlock', () => {
      const { getByTestId } = render(
        <MockedProvider>
          <JourneyProvider value={journey}>
            <BackgroundMediaVideo cardBlock={videoCard} />
          </JourneyProvider>
        </MockedProvider>
      )
      expect(getByTestId('videoPlaceholderStack')).toBeInTheDocument()
    })
    it('creates a new video cover block', async () => {
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
      const cardBlockResult = jest.fn(() => ({
        data: {
          cardBlockUpdate: {
            id: card.id,
            coverBlockId: image.id,
            __typename: 'CardBlock'
          }
        }
      }))
      const videoBlockResult = jest.fn(() => ({
        data: {
          videoBlockCreate: {
            id: video.id,
            title: video.title,
            startAt: video.startAt,
            endAt: video.endAt,
            muted: video.muted,
            autoplay: video.autoplay,
            parentBlockId: card.id,
            posterBlockId: video.posterBlockId,
            fullsize: video.fullsize,
            videoContent: video.videoContent,
            __typename: 'VideoBlock'
          }
        }
      }))
      const blockDeleteResult = jest.fn(() => ({
        data: {
          blockDelete: [
            {
              id: image.id,
              __typename: 'ImageBlock'
            }
          ]
        }
      }))
      const { getByRole } = render(
        <MockedProvider
          cache={cache}
          mocks={[
            {
              request: {
                query: BLOCK_DELETE_FOR_BACKGROUND_VIDEO,
                variables: {
                  id: image.id,
                  parentBlockId: image.parentBlockId,
                  journeyId: journey.id
                }
              },
              result: blockDeleteResult
            },
            {
              request: {
                query: CARD_BLOCK_COVER_VIDEO_UPDATE,
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
                query: CARD_BLOCK_COVER_VIDEO_BLOCK_CREATE,
                variables: {
                  input: {
                    journeyId: journey.id,
                    parentBlockId: card.id,
                    title: video.title,
                    startAt: video.startAt,
                    endAt: video.endAt,
                    muted: video.muted,
                    autoplay: video.autoplay,
                    posterBlockId: video.posterBlockId,
                    videoContent: { src: video.videoContent.src }
                  }
                }
              },
              result: videoBlockResult
            },
            {
              request: {
                query: CARD_BLOCK_COVER_VIDEO_UPDATE,
                variables: {
                  id: card.id,
                  journeyId: journey.id,
                  input: {
                    coverBlockId: video.id
                  }
                }
              },
              result: cardBlockResult
            }
          ]}
        >
          <JourneyProvider value={journey}>
            <BackgroundMediaVideo cardBlock={videoCard} debounceTime={0} />
          </JourneyProvider>
        </MockedProvider>
      )
      const textBox = await getByRole('textbox')
      fireEvent.change(textBox, {
        target: { value: video.videoContent.src }
      })
      await waitFor(() => expect(blockDeleteResult).toHaveBeenCalled())
      await waitFor(() => expect(cardBlockResult).toHaveBeenCalled())
      await waitFor(() => expect(videoBlockResult).toHaveBeenCalled())
      expect(cache.extract()[`Journey:${journey.id}`]?.blocks).toEqual([
        { __ref: `CardBlock:${card.id}` },
        { __ref: `VideoBlock:${video.id}` }
      ])
    })
  })
  describe('Existing video cover', () => {
    const existingCoverBlock: TreeBlock<CardBlock> = {
      ...card,
      coverBlockId: video.id,
      children: [
        {
          ...video,
          videoContent: {
            ...video.videoContent,
            src: 'https://example.com/video.mp4'
          }
        }
      ]
    }
    it('shows placeholders', async () => {
      const { getByTestId, getByRole } = render(
        <MockedProvider>
          <JourneyProvider value={journey}>
            <BackgroundMediaVideo cardBlock={existingCoverBlock} />
          </JourneyProvider>
        </MockedProvider>
      )
      expect(getByTestId('videoSrcStack')).toBeInTheDocument()
      const textBox = await getByRole('textbox')
      expect(textBox).toHaveValue('https://example.com/video.mp4')
    })

    it('updates video cover block', async () => {
      const cache = new InMemoryCache()
      cache.restore({
        ['Journey:' + journey.id]: {
          blocks: [
            { __ref: `CardBlock:${card.id}` },
            { __ref: `VideoBlock:${video.id}` }
          ],
          id: journey.id,
          __typename: 'Journey'
        }
      })
      const videoBlockResult = jest.fn(() => ({
        data: {
          imageBlockUpdate: {
            title: video.title,
            startAt: video.startAt,
            endAt: video.endAt,
            muted: video.muted,
            autoplay: video.autoplay,
            posterBlockId: video.posterBlockId,
            videoContent: video.videoContent,
            __typename: 'VideoBlock'
          }
        }
      }))
      const { getByRole } = render(
        <MockedProvider
          cache={cache}
          mocks={[
            {
              request: {
                query: CARD_BLOCK_COVER_VIDEO_BLOCK_UPDATE,
                variables: {
                  id: video.id,
                  journeyId: journey.id,
                  input: {
                    title: video.title,
                    startAt: video.startAt,
                    endAt: video.endAt,
                    muted: video.muted,
                    autoplay: video.autoplay,
                    posterBlockId: video.posterBlockId,
                    videoContent: { src: video.videoContent.src }
                  }
                }
              },
              result: videoBlockResult
            }
          ]}
        >
          <JourneyProvider value={journey}>
            <BackgroundMediaVideo
              cardBlock={{
                ...existingCoverBlock,
                children: [
                  {
                    ...video,
                    videoContent: {
                      src: 'https://example.com/video2.mp4',
                      __typename: 'VideoGeneric'
                    }
                  }
                ]
              }}
              debounceTime={0}
            />
          </JourneyProvider>
        </MockedProvider>
      )
      const textBox = await getByRole('textbox')
      await fireEvent.change(textBox, {
        target: { value: video.videoContent.src }
      })
      await waitFor(() => expect(videoBlockResult).toHaveBeenCalled())
      expect(textBox).toHaveValue(video.videoContent.src)
      expect(cache.extract()[`Journey:${journey.id}`]?.blocks).toEqual([
        { __ref: `CardBlock:${card.id}` },
        { __ref: `VideoBlock:${video.id}` }
      ])
    })
    it('deletes a video block', async () => {
      const cache = new InMemoryCache()
      cache.restore({
        ['Journey:' + journey.id]: {
          blocks: [
            { __ref: `CardBlock:${card.id}` },
            { __ref: `VideoBlock:${video.id}` }
          ],
          id: journey.id,
          __typename: 'Journey'
        }
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
          blockDelete: [
            {
              id: video.id,
              __typename: 'VideoBlock'
            }
          ]
        }
      }))
      const { getByTestId } = render(
        <MockedProvider
          cache={cache}
          mocks={[
            {
              request: {
                query: BLOCK_DELETE_FOR_BACKGROUND_VIDEO,
                variables: {
                  id: video.id,
                  parentBlockId: video.parentBlockId,
                  journeyId: journey.id
                }
              },
              result: blockDeleteResult
            },
            {
              request: {
                query: CARD_BLOCK_COVER_VIDEO_UPDATE,
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
            <BackgroundMediaVideo cardBlock={existingCoverBlock} />
          </JourneyProvider>
        </MockedProvider>
      )
      const button = await getByTestId('deleteVideo')
      fireEvent.click(button)
      await waitFor(() => expect(cardBlockResult).toHaveBeenCalled())
      expect(blockDeleteResult).toHaveBeenCalled()
      expect(cache.extract()[`Journey:${journey.id}`]?.blocks).toEqual([
        { __ref: `CardBlock:${card.id}` }
      ])
    })
    describe('settings', () => {
      it('shows settings', async () => {
        const { getAllByRole, getByRole } = render(
          <MockedProvider>
            <JourneyProvider value={journey}>
              <BackgroundMediaVideo cardBlock={existingCoverBlock} />
            </JourneyProvider>
          </MockedProvider>
        )
        fireEvent.click(await getByRole('tab', { name: 'Settings' }))
        const checkBoxes = await getAllByRole('checkbox')
        expect(checkBoxes[0]).toBeChecked()
        expect(checkBoxes[1]).toBeChecked()
        const textBoxes = await getAllByRole('textbox')
        expect(textBoxes[0]).toHaveValue('00:00:00')
        expect(textBoxes[1]).toHaveValue('00:00:00')
      })
      it('updates autoplay', async () => {
        const cache = new InMemoryCache()
        cache.restore({
          ['Journey:' + journey.id]: {
            blocks: [
              { __ref: `CardBlock:${card.id}` },
              { __ref: `VideoBlock:${video.id}` }
            ],
            id: journey.id,
            __typename: 'Journey'
          }
        })
        const videoBlockResult = jest.fn(() => ({
          data: {
            imageBlockUpdate: {
              title: video.title,
              startAt: video.startAt,
              endAt: video.endAt,
              muted: video.muted,
              autoplay: false,
              posterBlockId: video.posterBlockId,
              videoContent: video.videoContent,
              __typename: 'VideoBlock'
            }
          }
        }))
        const { getAllByRole, getByRole } = render(
          <MockedProvider
            cache={cache}
            mocks={[
              {
                request: {
                  query: CARD_BLOCK_COVER_VIDEO_BLOCK_UPDATE,
                  variables: {
                    id: video.id,
                    journeyId: journey.id,
                    input: {
                      title: video.title,
                      startAt: video.startAt,
                      endAt: video.endAt,
                      muted: video.muted,
                      autoplay: false,
                      posterBlockId: video.posterBlockId
                    }
                  }
                },
                result: videoBlockResult
              }
            ]}
          >
            <JourneyProvider value={journey}>
              <BackgroundMediaVideo cardBlock={existingCoverBlock} />
            </JourneyProvider>
          </MockedProvider>
        )
        fireEvent.click(await getByRole('tab', { name: 'Settings' }))
        const checkbox = await getAllByRole('checkbox')[0]
        fireEvent.click(checkbox)
        await waitFor(() => expect(videoBlockResult).toHaveBeenCalled())
      })
    })
    it('updates muted', async () => {
      const cache = new InMemoryCache()
      cache.restore({
        ['Journey:' + journey.id]: {
          blocks: [
            { __ref: `CardBlock:${card.id}` },
            { __ref: `VideoBlock:${video.id}` }
          ],
          id: journey.id,
          __typename: 'Journey'
        }
      })
      const videoBlockResult = jest.fn(() => ({
        data: {
          imageBlockUpdate: {
            title: video.title,
            startAt: video.startAt,
            endAt: video.endAt,
            muted: false,
            autoplay: video.autoplay,
            posterBlockId: video.posterBlockId,
            videoContent: video.videoContent,
            __typename: 'VideoBlock'
          }
        }
      }))
      const { getAllByRole, getByRole } = render(
        <MockedProvider
          cache={cache}
          mocks={[
            {
              request: {
                query: CARD_BLOCK_COVER_VIDEO_BLOCK_UPDATE,
                variables: {
                  id: video.id,
                  journeyId: journey.id,
                  input: {
                    title: video.title,
                    startAt: video.startAt,
                    endAt: video.endAt,
                    muted: false,
                    autoplay: video.autoplay,
                    posterBlockId: video.posterBlockId
                  }
                }
              },
              result: videoBlockResult
            }
          ]}
        >
          <JourneyProvider value={journey}>
            <BackgroundMediaVideo cardBlock={existingCoverBlock} />
          </JourneyProvider>
        </MockedProvider>
      )
      fireEvent.click(await getByRole('tab', { name: 'Settings' }))
      const checkbox = await getAllByRole('checkbox')[1]
      fireEvent.click(checkbox)
      await waitFor(() => expect(videoBlockResult).toHaveBeenCalled())
    })
    it('updates startAt', async () => {
      const cache = new InMemoryCache()
      cache.restore({
        ['Journey:' + journey.id]: {
          blocks: [
            { __ref: `CardBlock:${card.id}` },
            { __ref: `VideoBlock:${video.id}` }
          ],
          id: journey.id,
          __typename: 'Journey'
        }
      })
      const videoBlockResult = jest.fn(() => ({
        data: {
          imageBlockUpdate: {
            title: video.title,
            startAt: 11,
            endAt: video.endAt,
            muted: video.muted,
            autoplay: video.autoplay,
            posterBlockId: video.posterBlockId,
            videoContent: video.videoContent,
            __typename: 'VideoBlock'
          }
        }
      }))
      const { getAllByRole, getByRole } = render(
        <MockedProvider
          cache={cache}
          mocks={[
            {
              request: {
                query: CARD_BLOCK_COVER_VIDEO_BLOCK_UPDATE,
                variables: {
                  id: video.id,
                  journeyId: journey.id,
                  input: {
                    title: video.title,
                    startAt: 11,
                    endAt: video.endAt,
                    muted: video.muted,
                    autoplay: video.autoplay,
                    posterBlockId: video.posterBlockId
                  }
                }
              },
              result: videoBlockResult
            }
          ]}
        >
          <JourneyProvider value={journey}>
            <BackgroundMediaVideo
              cardBlock={existingCoverBlock}
              debounceTime={0}
            />
          </JourneyProvider>
        </MockedProvider>
      )
      fireEvent.click(await getByRole('tab', { name: 'Settings' }))
      const textbox = await getAllByRole('textbox')[0]
      fireEvent.change(textbox, { target: { value: '00:00:11' } })
      await waitFor(() => expect(videoBlockResult).toHaveBeenCalled())
    })
    it('updates endAt', async () => {
      const cache = new InMemoryCache()
      cache.restore({
        ['Journey:' + journey.id]: {
          blocks: [
            { __ref: `CardBlock:${card.id}` },
            { __ref: `VideoBlock:${video.id}` }
          ],
          id: journey.id,
          __typename: 'Journey'
        }
      })
      const videoBlockResult = jest.fn(() => ({
        data: {
          imageBlockUpdate: {
            title: video.title,
            startAt: video.startAt,
            endAt: 31,
            muted: video.muted,
            autoplay: video.autoplay,
            posterBlockId: video.posterBlockId,
            videoContent: video.videoContent,
            __typename: 'VideoBlock'
          }
        }
      }))
      const { getAllByRole, getByRole } = render(
        <MockedProvider
          cache={cache}
          mocks={[
            {
              request: {
                query: CARD_BLOCK_COVER_VIDEO_BLOCK_UPDATE,
                variables: {
                  id: video.id,
                  journeyId: journey.id,
                  input: {
                    title: video.title,
                    startAt: video.startAt,
                    endAt: 31,
                    muted: video.muted,
                    autoplay: video.autoplay,
                    posterBlockId: video.posterBlockId
                  }
                }
              },
              result: videoBlockResult
            }
          ]}
        >
          <JourneyProvider value={journey}>
            <BackgroundMediaVideo
              cardBlock={existingCoverBlock}
              debounceTime={0}
            />
          </JourneyProvider>
        </MockedProvider>
      )
      fireEvent.click(await getByRole('tab', { name: 'Settings' }))
      const textbox = await getAllByRole('textbox')[1]
      fireEvent.change(textbox, { target: { value: '00:00:31' } })
      await waitFor(() => expect(videoBlockResult).toHaveBeenCalled())
    })
  })
})
