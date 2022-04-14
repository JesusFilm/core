import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render } from '@testing-library/react'

import {
  GetJourney_journey_blocks_VideoBlock as VideoBlock,
  GetJourney_journey_blocks_ImageBlock as ImageBlock
} from '../../../../../../__generated__/GetJourney'
import { ThemeProvider } from '../../../../ThemeProvider'
import { VideoBlockEditorSettingsPoster } from './VideoBlockEditorSettingsPoster'

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
})
