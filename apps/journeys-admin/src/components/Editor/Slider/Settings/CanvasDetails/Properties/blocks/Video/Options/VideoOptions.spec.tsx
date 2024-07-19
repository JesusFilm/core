import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import type { TreeBlock } from '@core/journeys/ui/block'

import {
  BlockFields_StepBlock as StepBlock,
  BlockFields_VideoBlock as VideoBlock
} from '../../../../../../../../../../__generated__/BlockFields'
import { GetJourney_journey as Journey } from '../../../../../../../../../../__generated__/GetJourney'
import {
  ThemeMode,
  ThemeName,
  VideoBlockSource,
  VideoLabel
} from '../../../../../../../../../../__generated__/globalTypes'
import { ThemeProvider } from '../../../../../../../../ThemeProvider'
import { GET_VIDEO } from '../../../../../Drawer/VideoLibrary/VideoFromLocal/LocalDetails/LocalDetails'
import { GET_VIDEOS } from '../../../../../Drawer/VideoLibrary/VideoFromLocal/VideoFromLocal'
import { videos } from '../../../../../Drawer/VideoLibrary/VideoFromLocal/data'

import {
  UPDATE_VIDEO_BLOCK_NEXT_STEP,
  VIDEO_BLOCK_UPDATE,
  VideoOptions
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
        __typename: 'VideoTitle',
        value: 'FallingPlates'
      }
    ],
    image:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_0-FallingPlates.mobileCinematicHigh.jpg',
    variant: {
      __typename: 'VideoVariant',
      id: '2_0-FallingPlates-529',
      hls: 'https://arc.gt/hls/2_0-FallingPlates/529'
    },
    variantLanguages: []
  },
  posterBlockId: null,
  children: []
}

describe('VideoOptions', () => {
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
                  __typename: 'LanguageName'
                }
              ]
            }
          ]
        }
      }
    }
  }

  it('updates video block', async () => {
    const videoBlockResult = jest.fn((...args) => {
      console.log(args)
      return {
        data: {
          videoBlockUpdate: video
        }
      }
    })
    const result = jest.fn().mockReturnValue(getVideoMock.result)
    const videoBlockUpdateVariables = {
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
    render(
      <MockedProvider
        mocks={[
          { ...getVideoMock, result },
          getVideosMock,
          {
            request: {
              query: VIDEO_BLOCK_UPDATE,
              variables: videoBlockUpdateVariables
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
            <EditorProvider
              initialState={{
                selectedBlock: { ...video, videoId: null },
                selectedAttributeId: video.id
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
    await waitFor(() =>
      fireEvent.click(screen.getByRole('button', { name: 'Select Video' }))
    )
    await waitFor(() =>
      expect(screen.getByText('Brand Video')).toBeInTheDocument()
    )
    fireEvent.click(screen.getByText('Brand Video'))
    await waitFor(() =>
      expect(result).toHaveBeenCalledWith(getVideoMock.request.variables)
    )
    fireEvent.click(screen.getByRole('button', { name: 'Select' }))
    await waitFor(() =>
      expect(videoBlockResult).toHaveBeenCalledWith(videoBlockUpdateVariables)
    )
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
          parentBlockId: video.id,
          gtmEventName: 'gtmEventName',
          blockId: 'step1.id'
        }
      }
    }))

    const getVideoResult = jest.fn().mockReturnValue(getVideoMock.result)

    render(
      <MockedProvider
        mocks={[
          { ...getVideoMock, result: getVideoResult },
          getVideosMock,
          {
            request: {
              query: VIDEO_BLOCK_UPDATE,
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
            variant: 'admin'
          }}
        >
          <ThemeProvider>
            <EditorProvider
              initialState={{
                selectedStep,
                selectedBlock: { ...video, videoId: null },
                selectedAttributeId: video.id
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
    await waitFor(() =>
      fireEvent.click(screen.getByRole('button', { name: 'Select Video' }))
    )
    await waitFor(() =>
      expect(screen.getByText('Brand Video')).toBeInTheDocument()
    )
    fireEvent.click(screen.getByText('Brand Video'))
    await waitFor(() => expect(getVideoResult).toHaveBeenCalled())
    fireEvent.click(screen.getByRole('button', { name: 'Select' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(cache.extract()['VideoBlock:video1.id']?.action).toEqual({
      parentBlockId: 'video1.id',
      gtmEventName: 'gtmEventName',
      blockId: 'step1.id'
    })
  })
})
