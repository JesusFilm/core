import { MockedProvider } from '@apollo/client/testing'
import { TreeBlock, EditorProvider } from '@core/journeys/ui'
import { fireEvent, render, waitFor } from '@testing-library/react'

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
    const { getAllByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: VIDEO_BLOCK_UPDATE,
              variables: {
                id: video.id,
                journeyId: 'journeyId',
                input: {
                  videoId: '5_0-NUA0201-0-0',
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
    const textbox = await getAllByRole('textbox', { name: 'Video ID' })[0]
    fireEvent.focus(textbox)
    await fireEvent.change(textbox, {
      target: { value: '5_0-NUA0201-0-0' }
    })
    fireEvent.blur(textbox)
    await waitFor(() => expect(videoBlockResult).toHaveBeenCalled())
  })
})
