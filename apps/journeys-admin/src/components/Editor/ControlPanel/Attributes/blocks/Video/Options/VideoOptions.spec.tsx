import { MockedProvider } from '@apollo/client/testing'
import { TreeBlock, EditorProvider } from '@core/journeys/ui'
import { fireEvent, render, waitFor } from '@testing-library/react'

import {
  GetJourney_journey as Journey,
  GetJourney_journey_blocks_VideoBlock as VideoBlock
} from '../../../../../../../../__generated__/GetJourney'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../../../../../../__generated__/globalTypes'
import { JourneyProvider } from '../../../../../../../libs/context'
import { ThemeProvider } from '../../../../../../ThemeProvider'
import { VideoOptions, VIDEO_BLOCK_UPDATE } from './VideoOptions'

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

describe('VideoOptions', () => {
  it('updates video block', async () => {
    const videoBlockResult = jest.fn(() => ({
      data: {
        videoBlockUpdate: {
          id: video.id,
          title: video.title,
          startAt: video.startAt,
          endAt: video.endAt,
          muted: video.muted,
          autoplay: video.autoplay,
          parentOrder: video.parentOrder,
          posterBlockId: video.posterBlockId,
          videoContent: video.videoContent,
          __typename: 'VideoBlock'
        }
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
          <ThemeProvider>
            <EditorProvider
              initialState={{
                selectedBlock: {
                  ...video,
                  videoContent: { ...video.videoContent, src: '' }
                }
              }}
            >
              <VideoOptions />
            </EditorProvider>
          </ThemeProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    const textBox = await getAllByRole('textbox')[0]
    await fireEvent.change(textBox, {
      target: { value: video.videoContent.src }
    })
    fireEvent.blur(textBox)
    await waitFor(() => expect(videoBlockResult).toHaveBeenCalled())
  })
})
