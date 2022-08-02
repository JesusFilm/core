import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import {
  GetJourney_journey as Journey,
  GetJourney_journey_blocks_VideoBlock as VideoBlock,
  GetJourney_journey_blocks_ImageBlock as ImageBlock
} from '../../../../../../__generated__/GetJourney'
import { ThemeProvider } from '../../../../ThemeProvider'
import { VideoBlockEditorSettingsPoster } from './VideoBlockEditorSettingsPoster'
import { POSTER_IMAGE_BLOCK_UPDATE } from './Dialog/VideoBlockEditorSettingsPosterDialog'

const video: VideoBlock = {
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
  posterBlockId: null
}

const image: ImageBlock = {
  id: 'image1.id',
  __typename: 'ImageBlock',
  parentBlockId: video.id,
  parentOrder: 0,
  src: 'https://example.com/image.jpg',
  alt: 'image.jpg',
  width: 1920,
  height: 1080,
  blurhash: ''
}

describe('VideoBlockEditorSettingsPoster', () => {
  it('shows edit poster image dialog', () => {
    const { getByRole, getByTestId } = render(
      <MockedProvider>
        <ThemeProvider>
          <VideoBlockEditorSettingsPoster
            selectedBlock={image}
            parentBlockId={video.id}
          />
        </ThemeProvider>
      </MockedProvider>
    )
    fireEvent.click(getByTestId('posterCreateButton'))
    expect(getByRole('dialog')).toBeInTheDocument()
  })
  it('disables edit poster image button', () => {
    const { getByRole } = render(
      <MockedProvider>
        <ThemeProvider>
          <VideoBlockEditorSettingsPoster
            selectedBlock={image}
            parentBlockId={video.id}
            disabled
          />
        </ThemeProvider>
      </MockedProvider>
    )
    expect(getByRole('button')).toBeDisabled()
  })

  it('shows loading circle for coverImage update', async () => {
    const { getByRole, getByTestId } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: POSTER_IMAGE_BLOCK_UPDATE,
              variables: {
                id: image.id,
                journeyId: 'journeyId',
                input: {
                  src: 'http://example.com/test.jpg',
                  alt: 'test.jpg'
                }
              }
            },
            result: {
              data: {
                imageBlockUpdate: {
                  id: image.id,
                  src: 'http://example.com/test.jpg',
                  alt: 'test.jpg',
                  __typename: 'ImageBlock',
                  parentBlockId: video.id,
                  width: image.width,
                  height: image.height,
                  parentOrder: image.parentOrder,
                  blurhash: image.blurhash
                }
              }
            }
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
            <VideoBlockEditorSettingsPoster
              selectedBlock={image}
              parentBlockId={video.id}
            />
          </ThemeProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(getByTestId('posterCreateButton'))
    const textbox = getByRole('textbox')
    fireEvent.change(textbox, {
      target: { value: 'http://example.com/test.jpg' }
    })
    fireEvent.blur(textbox)
    await waitFor(() => expect(getByRole('progressbar')).toBeInTheDocument())
  })
})
