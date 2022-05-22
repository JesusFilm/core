import { MockedProvider } from '@apollo/client/testing'
import { TreeBlock, EditorProvider, JourneyProvider } from '@core/journeys/ui'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { InMemoryCache } from '@apollo/client'
import { GET_VIDEOS } from '../../../../../VideoLibrary/VideoList/VideoList'
import { GET_VIDEO } from '../../../../../VideoLibrary/VideoDetails/VideoDetails'
import { videos } from '../../../../../VideoLibrary/VideoList/VideoListData'
import {
  GetJourney_journey as Journey,
  GetJourney_journey_blocks_VideoBlock as VideoBlock,
  GetJourney_journey_blocks_StepBlock as StepBlock
} from '../../../../../../../../__generated__/GetJourney'
import {
  ThemeMode,
  ThemeName
} from '../../../../../../../../__generated__/globalTypes'
import { ThemeProvider } from '../../../../../../ThemeProvider'
import {
  VideoOptions,
  VIDEO_BLOCK_UPDATE,
  UPDATE_VIDEO_BLOCK_NEXT_STEP
} from './VideoOptions'

const video: TreeBlock<VideoBlock> = {
  id: 'video1.id',
  __typename: 'VideoBlock',
  parentBlockId: 'card1.id',
  parentOrder: 0,
  startAt: 0,
  endAt: null,
  muted: true,
  autoplay: true,
  fullsize: true,
  action: null,
  videoId: '2_0-FallingPlates',
  videoVariantLanguageId: '529',
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

describe('VideoOptions', () => {
  const mocks = [
    {
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
    },
    {
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
  ]

  it('updates video block', async () => {
    const videoBlockResult = jest.fn(() => ({
      data: {
        videoBlockUpdate: video
      }
    }))
    const { getByRole, getByText } = render(
      <MockedProvider
        mocks={[
          ...mocks,
          {
            request: {
              query: VIDEO_BLOCK_UPDATE,
              variables: {
                id: video.id,
                journeyId: 'journeyId',
                input: {
                  videoId: '2_0-Brand_Video',
                  videoVariantLanguageId: '529',
                  startAt: 0,
                  endAt: 144
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
            admin: true
          }}
        >
          <ThemeProvider>
            <EditorProvider
              initialState={{
                selectedBlock: video
              }}
            >
              <SnackbarProvider>
                <VideoOptions />
              </SnackbarProvider>
            </EditorProvider>
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
    await waitFor(() => expect(videoBlockResult).toHaveBeenCalledWith())
  })

  it('updates video nextBlockId to the next step by default', async () => {
    const selectedStep: TreeBlock<StepBlock> = {
      __typename: 'StepBlock',
      id: 'prevCard.id',
      parentBlockId: null,
      parentOrder: 0,
      locked: false,
      nextBlockId: 'step1.id',
      children: [
        {
          id: 'card1.id',
          __typename: 'CardBlock',
          parentBlockId: 'prevCard.id',
          parentOrder: 0,
          coverBlockId: null,
          backgroundColor: null,
          themeMode: null,
          themeName: null,
          fullscreen: false,
          children: [video]
        }
      ]
    }

    const cache = new InMemoryCache()
    cache.restore({
      'Journey:journeyId': {
        blocks: [{ __ref: 'VideoBlock:video1.id' }],
        id: 'journeyId',
        __typename: 'Journey'
      },
      'VideoBlock:video1.id': {
        ...video
      }
    })

    const result = jest.fn(() => ({
      data: {
        blockUpdateNavigateToBlockAction: {
          id: video.id,
          journeyId: 'journeyId',
          gtmEventName: 'gtmEventName',
          blockId: 'step1.id'
        }
      }
    }))

    const { getByText, getByRole } = render(
      <MockedProvider
        mocks={[
          ...mocks,
          {
            request: {
              query: VIDEO_BLOCK_UPDATE,
              variables: {
                id: video.id,
                journeyId: 'journeyId',
                input: {
                  videoId: '2_0-Brand_Video',
                  videoVariantLanguageId: '529',
                  startAt: 0,
                  endAt: 144
                }
              }
            },
            result: {
              data: {
                videoBlockUpdate: video
              }
            }
          },
          {
            request: {
              query: UPDATE_VIDEO_BLOCK_NEXT_STEP,
              variables: {
                id: video.id,
                journeyId: 'journeyId',
                input: {
                  blockId: 'step1.id'
                }
              }
            },
            result
          }
        ]}
        cache={cache}
      >
        <JourneyProvider
          value={{
            journey: {
              id: 'journeyId',
              themeMode: ThemeMode.light,
              themeName: ThemeName.base
            } as unknown as Journey,
            admin: true
          }}
        >
          <ThemeProvider>
            <EditorProvider
              initialState={{ selectedStep, selectedBlock: video }}
            >
              <SnackbarProvider>
                <VideoOptions />
              </SnackbarProvider>
            </EditorProvider>
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
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(cache.extract()['VideoBlock:video1.id']?.action).toEqual({
      gtmEventName: 'gtmEventName',
      blockId: 'step1.id'
    })
  })
})
