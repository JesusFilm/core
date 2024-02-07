import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
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
  VideoBlockSource,
  VideoLabel
} from '../../../../../../../../../__generated__/globalTypes'
import { ThemeProvider } from '../../../../../../../ThemeProvider'
import { videos } from '../../../../../../VideoLibrary/VideoFromLocal/data'
import { GET_VIDEO } from '../../../../../../VideoLibrary/VideoFromLocal/LocalDetails/LocalDetails'
import { GET_VIDEOS } from '../../../../../../VideoLibrary/VideoFromLocal/VideoFromLocal'

import {
  BLOCK_DELETE_FOR_BACKGROUND_VIDEO,
  BackgroundMediaVideo,
  CARD_BLOCK_COVER_VIDEO_BLOCK_CREATE,
  CARD_BLOCK_COVER_VIDEO_BLOCK_UPDATE
} from './BackgroundMediaVideo'

const card: TreeBlock<CardBlock> = {
  id: 'cardId',
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
  id: 'videoId',
  __typename: 'VideoBlock',
  parentBlockId: 'cardId',
  parentOrder: 0,
  startAt: 0,
  endAt: 144,
  muted: true,
  autoplay: true,
  fullsize: true,
  action: null,
  videoId: '2_0-FallingPlates',
  videoVariantLanguageId: '529',
  source: VideoBlockSource.internal,
  title: null,
  description: null,
  duration: 144,
  image: null,
  objectFit: null,
  video: {
    __typename: 'Video',
    id: '2_0-FallingPlates',
    title: [
      {
        __typename: 'Translation',
        value: '#FallingPlates'
      }
    ],
    image:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_0-FallingPlates.mobileCinematicHigh.jpg',
    variant: {
      __typename: 'VideoVariant',
      id: '2_0-FallingPlates-529',
      hls: 'https://arc.gt/zbrvj'
    }
  },
  posterBlockId: null,
  children: []
}

const image: TreeBlock<ImageBlock> = {
  id: 'imageId',
  __typename: 'ImageBlock',
  parentBlockId: 'cardId',
  parentOrder: 0,
  src: 'https://example.com/image.jpg',
  alt: 'https://example.com/image.jpg',
  width: 1920,
  height: 1080,
  blurhash: '',
  children: []
}

const getVideosMock = {
  request: {
    query: GET_VIDEOS,
    variables: {
      offset: 0,
      limit: 5,
      where: {
        availableVariantLanguageIds: ['529'],
        title: null,
        labels: [
          VideoLabel.episode,
          VideoLabel.featureFilm,
          VideoLabel.segment,
          VideoLabel.shortFilm
        ]
      }
    }
  },
  result: {
    data: {
      videos
    }
  }
}

const getVideoMock = {
  request: {
    query: GET_VIDEO,
    variables: {
      id: '2_0-Brand_Video',
      languageId: '529'
    }
  },
  result: {
    data: {
      video: {
        id: '2_0-Brand_Video',
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7302-0-0.mobileCinematicHigh.jpg',
        primaryLanguageId: '529',
        title: [
          {
            primary: true,
            value: 'Jesus Taken Up Into Heaven'
          }
        ],
        description: [
          {
            primary: true,
            value:
              'Jesus promises the Holy Spirit; then ascends into the clouds.'
          }
        ],
        variant: {
          id: 'variantA',
          duration: 144,
          hls: 'https://arc.gt/opsgn'
        },
        variantLanguages: [
          {
            __typename: 'Language',
            id: '529',
            name: [
              {
                value: 'English',
                primary: true,
                __typename: 'Translation'
              }
            ]
          }
        ]
      }
    }
  }
}

describe('BackgroundMediaVideo', () => {
  it('creates a new video cover block', async () => {
    const cache = new InMemoryCache()
    cache.restore({
      'Journey:journeyId': {
        blocks: [{ __ref: 'CardBlock:cardId' }],
        id: 'journeyId',
        __typename: 'Journey'
      },
      'CardBlock:cardId': { ...card }
    })
    const videoBlockResult = jest.fn(() => ({
      data: {
        videoBlockCreate: video
      }
    }))
    const getVideoResult = jest.fn().mockReturnValue(getVideoMock.result)
    const { getByRole, getByText } = render(
      <MockedProvider
        cache={cache}
        mocks={[
          getVideosMock,
          { ...getVideoMock, result: getVideoResult },
          {
            request: {
              query: CARD_BLOCK_COVER_VIDEO_BLOCK_CREATE,
              variables: {
                input: {
                  journeyId: 'journeyId',
                  parentBlockId: 'cardId',
                  videoId: '2_0-Brand_Video',
                  videoVariantLanguageId: '529',
                  source: VideoBlockSource.internal,
                  startAt: 0,
                  endAt: 144,
                  isCover: true,
                  duration: 144
                }
              }
            },
            result: videoBlockResult
          }
        ]}
      >
        <JourneyProvider
          value={{
            journey: { id: 'journeyId' } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <ThemeProvider>
            <SnackbarProvider>
              <BackgroundMediaVideo cardBlock={card} />
            </SnackbarProvider>
          </ThemeProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      fireEvent.click(getByRole('button', { name: 'Select Video' }))
    )
    await waitFor(() => expect(getByText('Brand Video')).toBeInTheDocument())
    fireEvent.click(getByText('Brand Video'))
    await waitFor(() => expect(getVideoResult).toHaveBeenCalled())
    fireEvent.click(getByRole('button', { name: 'Select' }))
    await waitFor(() => expect(videoBlockResult).toHaveBeenCalled())
    expect(cache.extract()['Journey:journeyId']?.blocks).toEqual([
      { __ref: 'CardBlock:cardId' },
      { __ref: 'VideoBlock:videoId' }
    ])
    expect(cache.extract()['CardBlock:cardId']?.coverBlockId).toEqual(video.id)
  })

  it('replaces existing image cover block', async () => {
    const imageCard: TreeBlock<CardBlock> = {
      ...card,
      coverBlockId: image.id,
      children: [image]
    }
    const cache = new InMemoryCache()
    cache.restore({
      'Journey:journeyId': {
        blocks: [
          { __ref: 'CardBlock:cardId' },
          { __ref: `ImageBlock:${image.id}` }
        ],
        id: 'journeyId',
        __typename: 'Journey'
      },
      'CardBlock:cardId': { ...card, coverBlockId: image.id }
    })
    const videoBlockResult = jest.fn(() => ({
      data: {
        videoBlockCreate: video
      }
    }))
    const getVideoResult = jest.fn().mockReturnValue(getVideoMock.result)
    const { getByRole, getByText } = render(
      <MockedProvider
        cache={cache}
        mocks={[
          getVideosMock,
          { ...getVideoMock, result: getVideoResult },
          {
            request: {
              query: CARD_BLOCK_COVER_VIDEO_BLOCK_CREATE,
              variables: {
                input: {
                  journeyId: 'journeyId',
                  parentBlockId: 'cardId',
                  videoId: '2_0-Brand_Video',
                  videoVariantLanguageId: '529',
                  source: VideoBlockSource.internal,
                  startAt: 0,
                  endAt: 144,
                  isCover: true,
                  duration: 144
                }
              }
            },
            result: videoBlockResult
          }
        ]}
      >
        <JourneyProvider
          value={{
            journey: { id: 'journeyId' } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <ThemeProvider>
            <SnackbarProvider>
              <BackgroundMediaVideo cardBlock={imageCard} />
            </SnackbarProvider>
          </ThemeProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Select Video' }))
    await waitFor(() => expect(getByText('Brand Video')).toBeInTheDocument())
    fireEvent.click(getByText('Brand Video'))
    await waitFor(() => expect(getVideoResult).toHaveBeenCalled())
    fireEvent.click(getByRole('button', { name: 'Select' }))
    await waitFor(() => expect(videoBlockResult).toHaveBeenCalled())
    expect(cache.extract()['Journey:journeyId']?.blocks).toEqual([
      { __ref: 'CardBlock:cardId' },
      { __ref: 'ImageBlock:imageId' },
      { __ref: 'VideoBlock:videoId' }
    ])
    expect(cache.extract()['CardBlock:cardId']?.coverBlockId).toEqual(video.id)
  })

  describe('Existing video cover', () => {
    const existingCoverBlock: TreeBlock<CardBlock> = {
      ...card,
      coverBlockId: video.id,
      children: [video]
    }

    it('updates video cover block', async () => {
      const cache = new InMemoryCache()
      cache.restore({
        'Journey:journeyId': {
          blocks: [
            { __ref: 'CardBlock:cardId' },
            { __ref: 'VideoBlock:videoId' }
          ],
          id: 'journeyId',
          __typename: 'Journey'
        }
      })
      const videoBlockResult = jest.fn(() => ({
        data: {
          videoBlockUpdate: video
        }
      }))
      const getVideoResult = jest.fn().mockReturnValue(getVideoMock.result)
      const { getByRole, getByText } = render(
        <MockedProvider
          cache={cache}
          mocks={[
            getVideosMock,
            { ...getVideoMock, result: getVideoResult },
            {
              request: {
                query: CARD_BLOCK_COVER_VIDEO_BLOCK_UPDATE,
                variables: {
                  id: video.id,
                  journeyId: 'journeyId',
                  input: {
                    videoId: '2_0-Brand_Video',
                    videoVariantLanguageId: '529',
                    source: VideoBlockSource.internal,
                    startAt: 0,
                    endAt: 144,
                    duration: 144
                  }
                }
              },
              result: videoBlockResult
            }
          ]}
        >
          <JourneyProvider
            value={{
              journey: { id: 'journeyId' } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <ThemeProvider>
              <SnackbarProvider>
                <BackgroundMediaVideo cardBlock={existingCoverBlock} />
              </SnackbarProvider>
            </ThemeProvider>
          </JourneyProvider>
        </MockedProvider>
      )
      await waitFor(() =>
        fireEvent.click(
          getByRole('button', { name: '#FallingPlates #FallingPlates' })
        )
      )
      await waitFor(() => expect(getByText('Brand_Video')).toBeInTheDocument())
      fireEvent.click(getByRole('button', { name: 'Close' }))
      fireEvent.click(getByText('Brand Video'))
      await waitFor(() => expect(getVideoResult).toHaveBeenCalled())
      fireEvent.click(getByRole('button', { name: 'Select' }))
      await waitFor(() => expect(videoBlockResult).toHaveBeenCalled())
      expect(cache.extract()['Journey:journeyId']?.blocks).toEqual([
        { __ref: 'CardBlock:cardId' },
        { __ref: 'VideoBlock:videoId' }
      ])
    })

    it('deletes video cover block when video removed', async () => {
      const cache = new InMemoryCache()
      cache.restore({
        'Journey:journeyId': {
          blocks: [
            { __ref: 'CardBlock:cardId' },
            { __ref: 'VideoBlock:videoId' }
          ],
          id: 'journeyId',
          __typename: 'Journey'
        }
      })
      const videoBlockResult = jest.fn(() => ({
        data: {
          blockDelete: []
        }
      }))
      const { getByRole, getByText } = render(
        <MockedProvider
          cache={cache}
          mocks={[
            getVideosMock,
            getVideoMock,
            {
              request: {
                query: BLOCK_DELETE_FOR_BACKGROUND_VIDEO,
                variables: {
                  id: 'videoId',
                  parentBlockId: 'step1.id',
                  journeyId: 'journeyId'
                }
              },
              result: videoBlockResult
            }
          ]}
        >
          <JourneyProvider
            value={{
              journey: { id: 'journeyId' } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <ThemeProvider>
              <SnackbarProvider>
                <BackgroundMediaVideo cardBlock={existingCoverBlock} />
              </SnackbarProvider>
            </ThemeProvider>
          </JourneyProvider>
        </MockedProvider>
      )
      fireEvent.click(
        getByRole('button', { name: '#FallingPlates #FallingPlates' })
      )
      await waitFor(() => expect(getByText('Brand_Video')).toBeInTheDocument())
      fireEvent.click(getByRole('button', { name: 'clear-video' }))
      await waitFor(() => expect(videoBlockResult).toHaveBeenCalled())
      expect(cache.extract()['Journey:journeyId']?.blocks).toEqual([
        { __ref: 'CardBlock:cardId' }
      ])
    })

    describe('Video Settings', () => {
      const existingCoverBlockWithId: TreeBlock<CardBlock> = {
        ...card,
        coverBlockId: video.id,
        children: [{ ...video, videoId: 'id' }]
      }

      it('shows settings', async () => {
        const { getAllByRole } = render(
          <MockedProvider>
            <JourneyProvider
              value={{
                journey: { id: 'journeyId' } as unknown as Journey,
                variant: 'admin'
              }}
            >
              <ThemeProvider>
                <SnackbarProvider>
                  <BackgroundMediaVideo cardBlock={existingCoverBlockWithId} />
                </SnackbarProvider>
              </ThemeProvider>
            </JourneyProvider>
          </MockedProvider>
        )
        expect(getAllByRole('checkbox', { name: 'Muted' })[0]).toBeChecked()
        expect(getAllByRole('checkbox', { name: 'Autoplay' })[0]).toBeChecked()
        expect(getAllByRole('textbox', { name: 'Starts At' })[0]).toHaveValue(
          '00:00:00'
        )
        expect(getAllByRole('textbox', { name: 'Ends At' })[0]).toHaveValue(
          '00:02:24'
        )
      })

      it('updates autoplay', async () => {
        const cache = new InMemoryCache()
        cache.restore({
          'Journey:journeyId': {
            blocks: [
              { __ref: 'CardBlock:cardId' },
              { __ref: 'VideoBlock:videoId' }
            ],
            id: 'journeyId',
            __typename: 'Journey'
          }
        })
        const videoBlockResult = jest.fn(() => ({
          data: {
            videoBlockUpdate: {
              ...video,
              autoplay: false
            }
          }
        }))
        const { getAllByRole } = render(
          <MockedProvider
            cache={cache}
            mocks={[
              {
                request: {
                  query: CARD_BLOCK_COVER_VIDEO_BLOCK_UPDATE,
                  variables: {
                    id: video.id,
                    journeyId: 'journeyId',
                    input: {
                      startAt: 0,
                      endAt: 144,
                      muted: true,
                      autoplay: false,
                      objectFit: 'fill'
                    }
                  }
                },
                result: videoBlockResult
              }
            ]}
          >
            <JourneyProvider
              value={{
                journey: { id: 'journeyId' } as unknown as Journey,
                variant: 'admin'
              }}
            >
              <ThemeProvider>
                <SnackbarProvider>
                  <BackgroundMediaVideo cardBlock={existingCoverBlockWithId} />
                </SnackbarProvider>
              </ThemeProvider>
            </JourneyProvider>
          </MockedProvider>
        )
        const checkbox = await getAllByRole('checkbox', { name: 'Autoplay' })[0]
        fireEvent.click(checkbox)
        await waitFor(() => expect(videoBlockResult).toHaveBeenCalled())
      })

      it('updates muted', async () => {
        const cache = new InMemoryCache()
        cache.restore({
          'Journey:journeyId': {
            blocks: [
              { __ref: 'CardBlock:cardId' },
              { __ref: 'VideoBlock:videoId' }
            ],
            id: 'journeyId',
            __typename: 'Journey'
          }
        })
        const videoBlockResult = jest.fn(() => ({
          data: {
            videoBlockUpdate: video
          }
        }))
        const { getAllByRole } = render(
          <MockedProvider
            cache={cache}
            mocks={[
              {
                request: {
                  query: CARD_BLOCK_COVER_VIDEO_BLOCK_UPDATE,
                  variables: {
                    id: video.id,
                    journeyId: 'journeyId',
                    input: {
                      startAt: 0,
                      endAt: 144,
                      muted: false,
                      autoplay: true,
                      objectFit: 'fill'
                    }
                  }
                },
                result: videoBlockResult
              }
            ]}
          >
            <JourneyProvider
              value={{
                journey: { id: 'journeyId' } as unknown as Journey,
                variant: 'admin'
              }}
            >
              <ThemeProvider>
                <SnackbarProvider>
                  <BackgroundMediaVideo cardBlock={existingCoverBlockWithId} />
                </SnackbarProvider>
              </ThemeProvider>
            </JourneyProvider>
          </MockedProvider>
        )
        const checkbox = await getAllByRole('checkbox', { name: 'Muted' })[0]
        fireEvent.click(checkbox)
        await waitFor(() => expect(videoBlockResult).toHaveBeenCalled())
      })

      it('updates startAt', async () => {
        const cache = new InMemoryCache()
        cache.restore({
          'Journey:journeyId': {
            blocks: [
              { __ref: 'CardBlock:cardId' },
              { __ref: 'VideoBlock:videoId' }
            ],
            id: 'journeyId',
            __typename: 'Journey'
          }
        })
        const videoBlockResult = jest.fn(() => ({
          data: {
            videoBlockUpdate: video
          }
        }))
        const { getAllByRole } = render(
          <MockedProvider
            cache={cache}
            mocks={[
              {
                request: {
                  query: CARD_BLOCK_COVER_VIDEO_BLOCK_UPDATE,
                  variables: {
                    id: video.id,
                    journeyId: 'journeyId',
                    input: {
                      startAt: 11,
                      endAt: 144,
                      autoplay: true,
                      muted: true,
                      objectFit: 'fill'
                    }
                  }
                },
                result: videoBlockResult
              }
            ]}
          >
            <JourneyProvider
              value={{
                journey: { id: 'journeyId' } as unknown as Journey,
                variant: 'admin'
              }}
            >
              <ThemeProvider>
                <SnackbarProvider>
                  <BackgroundMediaVideo cardBlock={existingCoverBlockWithId} />
                </SnackbarProvider>
              </ThemeProvider>
            </JourneyProvider>
          </MockedProvider>
        )
        const textbox = await getAllByRole('textbox', { name: 'Starts At' })[0]
        fireEvent.change(textbox, { target: { value: '00:00:11' } })
        fireEvent.blur(textbox)
        await waitFor(() => expect(videoBlockResult).toHaveBeenCalled())
      })

      it('updates endAt', async () => {
        const cache = new InMemoryCache()
        cache.restore({
          'Journey:journeyId': {
            blocks: [
              { __ref: 'CardBlock:cardId' },
              { __ref: 'VideoBlock:videoId' }
            ],
            id: 'journeyId',
            __typename: 'Journey'
          }
        })
        const videoBlockResult = jest.fn(() => ({
          data: {
            videoBlockUpdate: video
          }
        }))
        const { getAllByRole } = render(
          <MockedProvider
            cache={cache}
            mocks={[
              {
                request: {
                  query: CARD_BLOCK_COVER_VIDEO_BLOCK_UPDATE,
                  variables: {
                    id: video.id,
                    journeyId: 'journeyId',
                    input: {
                      autoplay: true,
                      muted: true,
                      startAt: 0,
                      endAt: 31,
                      objectFit: 'fill'
                    }
                  }
                },
                result: videoBlockResult
              }
            ]}
          >
            <ThemeProvider>
              <JourneyProvider
                value={{
                  journey: { id: 'journeyId' } as unknown as Journey,
                  variant: 'admin'
                }}
              >
                <SnackbarProvider>
                  <BackgroundMediaVideo cardBlock={existingCoverBlockWithId} />
                </SnackbarProvider>
              </JourneyProvider>
            </ThemeProvider>
          </MockedProvider>
        )
        const textbox = await getAllByRole('textbox', { name: 'Ends At' })[0]
        fireEvent.change(textbox, { target: { value: '00:00:31' } })
        fireEvent.blur(textbox)
        await waitFor(() => expect(videoBlockResult).toHaveBeenCalled())
      })
    })
  })
})
