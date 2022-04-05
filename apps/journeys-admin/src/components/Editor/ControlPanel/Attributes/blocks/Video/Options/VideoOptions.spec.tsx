import { MockedProvider } from '@apollo/client/testing'
import { TreeBlock, EditorProvider } from '@core/journeys/ui'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { GET_VIDEOS } from '../../../../../VideoLibrary/VideoList/VideoList'
import { GET_VIDEO } from '../../../../../VideoLibrary/VideoDetails/VideoDetails'
import { videos } from '../../../../../VideoLibrary/VideoList/VideoListData'
import {
  GetJourney_journey as Journey,
  GetJourney_journey_blocks_VideoBlock as VideoBlock
} from '../../../../../../../../__generated__/GetJourney'
import { JourneyProvider } from '../../../../../../../libs/context'
import { ThemeProvider } from '../../../../../../ThemeProvider'
import { VideoOptions, VIDEO_BLOCK_UPDATE } from './VideoOptions'

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
  posterBlockId: null,
  children: []
}

describe('VideoOptions', () => {
  it('updates video block', async () => {
    const videoBlockResult = jest.fn(() => ({
      data: {
        videoBlockUpdate: video
      }
    }))
    const { getByRole, getByText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_VIDEOS,
              variables: {
                where: {
                  availableVariantLanguageIds: ['529'],
                  title: null
                }
              }
            },
            result: {
              data: {
                videos: [...videos, ...videos, ...videos]
              }
            }
          },
          {
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
                    duration: 144,
                    hls: 'https://arc.gt/opsgn'
                  }
                }
              }
            }
          },
          {
            request: {
              query: VIDEO_BLOCK_UPDATE,
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
            <EditorProvider
              initialState={{
                selectedBlock: video
              }}
            >
              <VideoOptions />
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
})
