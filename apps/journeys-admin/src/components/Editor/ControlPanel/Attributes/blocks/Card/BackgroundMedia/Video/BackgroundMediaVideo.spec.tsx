import { TreeBlock } from '@core/journeys/ui'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { InMemoryCache } from '@apollo/client'
import { SnackbarProvider } from 'notistack'

import {
  GetJourney_journey as Journey,
  GetJourney_journey_blocks_CardBlock as CardBlock,
  GetJourney_journey_blocks_ImageBlock as ImageBlock,
  GetJourney_journey_blocks_VideoBlock as VideoBlock
} from '../../../../../../../../../__generated__/GetJourney'
import { JourneyProvider } from '../../../../../../../../libs/context'
import { ThemeProvider } from '../../../../../../../ThemeProvider'
import { GET_VIDEOS } from '../../../../../../VideoLibrary/VideoList/VideoList'
import { GET_VIDEO } from '../../../../../../VideoLibrary/VideoDetails/VideoDetails'
import { videos } from '../../../../../../VideoLibrary/VideoList/VideoListData'
import {
  BackgroundMediaVideo,
  CARD_BLOCK_COVER_VIDEO_BLOCK_CREATE,
  CARD_BLOCK_COVER_VIDEO_BLOCK_UPDATE,
  CARD_BLOCK_COVER_VIDEO_UPDATE,
  BLOCK_DELETE_FOR_BACKGROUND_VIDEO
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
  endAt: null,
  muted: true,
  autoplay: true,
  fullsize: true,
  videoId: '5_0-NUA0201-0-0',
  videoVariantLanguageId: '529',
  video: {
    __typename: 'Video',
    id: '5_0-NUA0201-0-0',
    variant: {
      __typename: 'VideoVariant',
      id: '5_0-NUA0201-0-0-529',
      hls: 'https://arc.gt/hls/5_0-NUA0201-0-0/529'
    }
  },
  posterBlockId: null,
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
        title: null
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
      id: '2_0-Brand_Video'
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
        }
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
      }
    })
    const cardBlockResult = jest.fn(() => ({
      data: {
        cardBlockUpdate: {
          id: 'cardId',
          coverBlockId: video.id,
          __typename: 'CardBlock'
        }
      }
    }))
    const videoBlockResult = jest.fn(() => ({
      data: {
        videoBlockCreate: video
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
              query: CARD_BLOCK_COVER_VIDEO_BLOCK_CREATE,
              variables: {
                input: {
                  journeyId: 'journeyId',
                  parentBlockId: 'cardId',
                  videoId: '2_0-Brand_Video',
                  videoVariantLanguageId: '529'
                }
              }
            },
            result: videoBlockResult
          },
          {
            request: {
              query: CARD_BLOCK_COVER_VIDEO_UPDATE,
              variables: {
                id: 'cardId',
                journeyId: 'journeyId',
                input: {
                  coverBlockId: video.id
                }
              }
            },
            result: cardBlockResult
          }
        ]}
      >
        <JourneyProvider value={{ id: 'journeyId' } as unknown as Journey}>
          <ThemeProvider>
            <SnackbarProvider>
              <BackgroundMediaVideo cardBlock={card} />
            </SnackbarProvider>
          </ThemeProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Select a Video' }))
    await waitFor(() => expect(getByText('Brand Video')).toBeInTheDocument())
    fireEvent.click(getByText('Brand Video'))
    await waitFor(() =>
      expect(getByRole('button', { name: 'Select' })).toBeEnabled()
    )
    fireEvent.click(getByRole('button', { name: 'Select' }))
    await waitFor(() => expect(videoBlockResult).toHaveBeenCalled())
    await waitFor(() => expect(cardBlockResult).toHaveBeenCalled())
    expect(cache.extract()['Journey:journeyId']?.blocks).toEqual([
      { __ref: 'CardBlock:cardId' },
      { __ref: 'VideoBlock:videoId' }
    ])
  })

  it('replaces existing image cover block', async () => {
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
    const videoCard: TreeBlock<CardBlock> = {
      ...card,
      coverBlockId: image.id,
      children: [image]
    }
    const cache = new InMemoryCache()
    cache.restore({
      'Journey:journeyId': {
        blocks: [
          { __ref: 'CardBlock:cardId' },
          { __ref: 'ImageBlock:imageId' }
        ],
        id: 'journeyId',
        __typename: 'Journey'
      }
    })
    const cardBlockResult = jest.fn(() => ({
      data: {
        cardBlockUpdate: {
          id: 'cardId',
          coverBlockId: image.id,
          __typename: 'CardBlock'
        }
      }
    }))
    const videoBlockResult = jest.fn(() => ({
      data: {
        videoBlockCreate: video
      }
    }))
    const blockDeleteResult = jest.fn(() => ({
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
                id: image.id,
                parentBlockId: image.parentBlockId,
                journeyId: 'journeyId'
              }
            },
            result: blockDeleteResult
          },
          {
            request: {
              query: CARD_BLOCK_COVER_VIDEO_UPDATE,
              variables: {
                id: 'cardId',
                journeyId: 'journeyId',
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
                  journeyId: 'journeyId',
                  parentBlockId: 'cardId',
                  videoId: '2_0-Brand_Video',
                  videoVariantLanguageId: '529'
                }
              }
            },
            result: videoBlockResult
          },
          {
            request: {
              query: CARD_BLOCK_COVER_VIDEO_UPDATE,
              variables: {
                id: 'cardId',
                journeyId: 'journeyId',
                input: {
                  coverBlockId: video.id
                }
              }
            },
            result: cardBlockResult
          }
        ]}
      >
        <JourneyProvider value={{ id: 'journeyId' } as unknown as Journey}>
          <ThemeProvider>
            <SnackbarProvider>
              <BackgroundMediaVideo cardBlock={videoCard} />
            </SnackbarProvider>
          </ThemeProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Select a Video' }))
    await waitFor(() => expect(getByText('Brand Video')).toBeInTheDocument())
    fireEvent.click(getByText('Brand Video'))
    await waitFor(() =>
      expect(getByRole('button', { name: 'Select' })).toBeEnabled()
    )
    fireEvent.click(getByRole('button', { name: 'Select' }))
    await waitFor(() => expect(blockDeleteResult).toHaveBeenCalled())
    await waitFor(() => expect(cardBlockResult).toHaveBeenCalled())
    await waitFor(() => expect(videoBlockResult).toHaveBeenCalled())
    expect(cache.extract()['Journey:journeyId']?.blocks).toEqual([
      { __ref: 'CardBlock:cardId' },
      { __ref: 'VideoBlock:videoId' }
    ])
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
        ['Journey:' + 'journeyId']: {
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
      const { getByRole, getByText } = render(
        <MockedProvider
          cache={cache}
          mocks={[
            getVideosMock,
            getVideoMock,
            {
              request: {
                query: CARD_BLOCK_COVER_VIDEO_BLOCK_UPDATE,
                variables: {
                  id: video.id,
                  journeyId: 'journeyId',
                  input: {
                    videoId: '2_0-Brand_Video',
                    videoVariantLanguageId: '529'
                  }
                }
              },
              result: videoBlockResult
            }
          ]}
        >
          <JourneyProvider value={{ id: 'journeyId' } as unknown as Journey}>
            <ThemeProvider>
              <SnackbarProvider>
                <BackgroundMediaVideo cardBlock={existingCoverBlock} />
              </SnackbarProvider>
            </ThemeProvider>
          </JourneyProvider>
        </MockedProvider>
      )
      fireEvent.click(getByRole('button', { name: 'Select a Video' }))
      await waitFor(() => expect(getByText('Brand_Video')).toBeInTheDocument())
      fireEvent.click(getByText('Brand Video'))
      await waitFor(() =>
        expect(getByRole('button', { name: 'Select' })).toBeEnabled()
      )
      fireEvent.click(getByRole('button', { name: 'Select' }))
      await waitFor(() => expect(videoBlockResult).toHaveBeenCalled())
      expect(cache.extract()['Journey:journeyId']?.blocks).toEqual([
        { __ref: 'CardBlock:cardId' },
        { __ref: 'VideoBlock:videoId' }
      ])
    })

    it('deletes a video block', async () => {
      const cache = new InMemoryCache()
      cache.restore({
        'Journey:journeyId': {
          blocks: [
            { __ref: 'CardBlock:cardId' },
            { __ref: 'VideoBlock:videoId' }
          ],
          id: 'journeyId',
          __typename: 'Journey'
        },
        'VideoBlock:videoId': { ...video }
      })
      const cardBlockResult = jest.fn(() => ({
        data: {
          cardBlockUpdate: {
            id: 'cardId',
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
                query: BLOCK_DELETE_FOR_BACKGROUND_VIDEO,
                variables: {
                  id: video.id,
                  parentBlockId: video.parentBlockId,
                  journeyId: 'journeyId'
                }
              },
              result: blockDeleteResult
            },
            {
              request: {
                query: CARD_BLOCK_COVER_VIDEO_UPDATE,
                variables: {
                  id: 'cardId',
                  journeyId: 'journeyId',
                  input: {
                    coverBlockId: null
                  }
                }
              },
              result: cardBlockResult
            }
          ]}
        >
          <ThemeProvider>
            <JourneyProvider value={{ id: 'journeyId' } as unknown as Journey}>
              <SnackbarProvider>
                <BackgroundMediaVideo cardBlock={existingCoverBlock} />
              </SnackbarProvider>
            </JourneyProvider>
          </ThemeProvider>
        </MockedProvider>
      )
      const button = await getByTestId('imageBlockHeaderDelete')
      fireEvent.click(button)
      await waitFor(() => expect(cardBlockResult).toHaveBeenCalled())
      expect(blockDeleteResult).toHaveBeenCalled()
      expect(cache.extract()['Journey:journeyId']?.blocks).toEqual([
        { __ref: 'CardBlock:cardId' }
      ])
      expect(cache.extract()['VideoBlock:videoId']).toBeUndefined()
    })

    describe('Video Settings', () => {
      it('shows settings', async () => {
        const { getAllByRole } = render(
          <MockedProvider>
            <JourneyProvider value={{ id: 'journeyId' } as unknown as Journey}>
              <ThemeProvider>
                <SnackbarProvider>
                  <BackgroundMediaVideo cardBlock={existingCoverBlock} />
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
          '00:00:00'
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
                      endAt: 0,
                      muted: true,
                      autoplay: false
                    }
                  }
                },
                result: videoBlockResult
              }
            ]}
          >
            <JourneyProvider value={{ id: 'journeyId' } as unknown as Journey}>
              <ThemeProvider>
                <SnackbarProvider>
                  <BackgroundMediaVideo cardBlock={existingCoverBlock} />
                </SnackbarProvider>
              </ThemeProvider>
            </JourneyProvider>
          </MockedProvider>
        )
        const checkbox = await getAllByRole('checkbox', { name: 'Autoplay' })[0]
        fireEvent.click(checkbox)
        await waitFor(() => expect(videoBlockResult).toHaveBeenCalled())
      })
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
                    endAt: 0,
                    muted: false,
                    autoplay: true
                  }
                }
              },
              result: videoBlockResult
            }
          ]}
        >
          <JourneyProvider value={{ id: 'journeyId' } as unknown as Journey}>
            <ThemeProvider>
              <SnackbarProvider>
                <BackgroundMediaVideo cardBlock={existingCoverBlock} />
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
                    endAt: 0,
                    autoplay: true,
                    muted: true
                  }
                }
              },
              result: videoBlockResult
            }
          ]}
        >
          <JourneyProvider value={{ id: 'journeyId' } as unknown as Journey}>
            <ThemeProvider>
              <SnackbarProvider>
                <BackgroundMediaVideo cardBlock={existingCoverBlock} />
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
                    endAt: 31
                  }
                }
              },
              result: videoBlockResult
            }
          ]}
        >
          <ThemeProvider>
            <JourneyProvider value={{ id: 'journeyId' } as unknown as Journey}>
              <SnackbarProvider>
                <BackgroundMediaVideo cardBlock={existingCoverBlock} />
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
