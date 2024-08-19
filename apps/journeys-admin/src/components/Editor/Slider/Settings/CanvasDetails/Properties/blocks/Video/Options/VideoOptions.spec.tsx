import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import { BlockFields_VideoBlock as VideoBlock } from '../../../../../../../../../../__generated__/BlockFields'
import {
  VideoBlockSource,
  VideoLabel
} from '../../../../../../../../../../__generated__/globalTypes'
import { ThemeProvider } from '../../../../../../../../ThemeProvider'
import { CommandUndoItem } from '../../../../../../../Toolbar/Items/CommandUndoItem'
import { videos } from '../../../../../Drawer/VideoLibrary/VideoFromLocal/data'
import { GET_VIDEO } from '../../../../../Drawer/VideoLibrary/VideoFromLocal/LocalDetails/LocalDetails'
import { GET_VIDEOS } from '../../../../../Drawer/VideoLibrary/VideoFromLocal/VideoFromLocal'

import { VIDEO_BLOCK_UPDATE, VideoOptions } from './VideoOptions'

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
    const videoBlockResult = jest.fn(() => {
      return {
        data: {
          videoBlockUpdate: video
        }
      }
    })
    const result = jest.fn().mockReturnValue(getVideoMock.result)
    const videoBlockUpdateVariables = {
      id: video.id,
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
        <EditorProvider
          initialState={{
            selectedBlock: { ...video, videoId: null },
            selectedAttributeId: video.id
          }}
        >
          <ThemeProvider>
            <VideoOptions />
          </ThemeProvider>
        </EditorProvider>
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

  it('should undo the property change', async () => {
    const result = jest.fn().mockReturnValue(getVideoMock.result)
    const result1 = jest.fn().mockReturnValue({
      data: {
        videoBlockUpdate: video
      }
    })
    const result2 = jest.fn().mockReturnValue({
      data: {
        videoBlockUpdate: video
      }
    })
    render(
      <MockedProvider
        mocks={[
          { ...getVideoMock, result },
          getVideosMock,
          {
            request: {
              query: VIDEO_BLOCK_UPDATE,
              variables: {
                id: video.id,
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
            result: result1
          },
          {
            request: {
              query: VIDEO_BLOCK_UPDATE,
              variables: {
                id: video.id,
                input: {
                  startAt: 0,
                  endAt: null,
                  duration: null,
                  videoId: null,
                  videoVariantLanguageId: '529',
                  source: VideoBlockSource.internal
                }
              }
            },
            result: result2
          }
        ]}
      >
        <EditorProvider
          initialState={{
            selectedBlock: { ...video, videoId: null },
            selectedAttributeId: video.id
          }}
        >
          <ThemeProvider>
            <CommandUndoItem variant="button" />
            <VideoOptions />
          </ThemeProvider>
        </EditorProvider>
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
    await waitFor(() => expect(result1).toHaveBeenCalled())
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(result2).toHaveBeenCalled())
  })
})
