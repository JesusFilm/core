import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { InfiniteHitsRenderState } from 'instantsearch.js/es/connectors/infinite-hits/connectInfiniteHits'
import { SearchBoxRenderState } from 'instantsearch.js/es/connectors/search-box/connectSearchBox'
import {
  InstantSearchApi,
  useInfiniteHits,
  useInstantSearch,
  useSearchBox
} from 'react-instantsearch'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import { BlockFields_VideoBlock as VideoBlock } from '../../../../../../../../../../__generated__/BlockFields'
import { VideoBlockSource } from '../../../../../../../../../../__generated__/globalTypes'
import { ThemeProvider } from '../../../../../../../../ThemeProvider'
import { CommandUndoItem } from '../../../../../../../Toolbar/Items/CommandUndoItem'
import { videoItems } from '../../../../../Drawer/VideoLibrary/data'
import { GET_VIDEO } from '../../../../../Drawer/VideoLibrary/VideoFromLocal/LocalDetails/LocalDetails'

import { VIDEO_BLOCK_UPDATE, VideoOptions } from './VideoOptions'

jest.mock('react-instantsearch')

const mockUseSearchBox = useSearchBox as jest.MockedFunction<
  typeof useSearchBox
>
const mockUseInstantSearch = useInstantSearch as jest.MockedFunction<
  typeof useInstantSearch
>
const mockUseInfiniteHits = useInfiniteHits as jest.MockedFunction<
  typeof useInfiniteHits
>

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
  mediaVideo: {
    __typename: 'Video',
    id: '2_0-FallingPlates',
    title: [
      {
        __typename: 'VideoTitle',
        value: 'FallingPlates'
      }
    ],
    images: [
      {
        __typename: 'CloudflareImage',
        mobileCinematicHigh:
          'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/2_0-FallingPlates.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95'
      }
    ],
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
  const getVideoMock = {
    request: {
      query: GET_VIDEO,
      variables: {
        id: 'videoId',
        languageId: '529'
      }
    },
    result: {
      data: {
        video: {
          id: 'videoId',
          images: [
            {
              __typename: 'CloudflareImage',
              mobileCinematicHigh:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/2_0-FallingPlates.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95'
            }
          ],
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
              slug: 'english',
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

  const searchBox = {
    refine: jest.fn()
  } as unknown as SearchBoxRenderState

  const infiniteHits = {
    items: videoItems,
    showMore: jest.fn(),
    isLastPage: false
  } as unknown as InfiniteHitsRenderState

  const instantSearch = {
    status: 'idle',
    results: {
      __isArtificial: false,
      nbHits: videoItems.length
    }
  } as unknown as InstantSearchApi

  beforeEach(() => {
    mockUseSearchBox.mockReturnValue(searchBox)
    mockUseInfiniteHits.mockReturnValue(infiniteHits)
    mockUseInstantSearch.mockReturnValue(instantSearch)
    jest.clearAllMocks()
  })

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
        videoId: 'videoId',
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
    await waitFor(() => fireEvent.click(screen.getByText('title1')))
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

          {
            request: {
              query: VIDEO_BLOCK_UPDATE,
              variables: {
                id: video.id,
                input: {
                  videoId: 'videoId',
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
    await waitFor(() => expect(screen.getByText('title1')).toBeInTheDocument())
    fireEvent.click(screen.getByText('title1'))
    await waitFor(() =>
      expect(result).toHaveBeenCalledWith(getVideoMock.request.variables)
    )
    fireEvent.click(screen.getByRole('button', { name: 'Select' }))
    await waitFor(() => expect(result1).toHaveBeenCalled())
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(result2).toHaveBeenCalled())
  })
})
