import { MockedProvider } from '@apollo/client/testing'
import useMediaQuery from '@mui/material/useMediaQuery'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import {
  BlockFields_ImageBlock as ImageBlock,
  BlockFields_VideoBlock as VideoBlock
} from '../../../../../../../../../__generated__/BlockFields'
import { VideoBlockSource } from '../../../../../../../../../__generated__/globalTypes'
import { ThemeProvider } from '../../../../../../../ThemeProvider'

import { VideoBlockEditorSettingsPoster } from './VideoBlockEditorSettingsPoster'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

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
  blurhash: '',
  scale: null,
  focalLeft: 50,
  focalTop: 50
}

describe('VideoBlockEditorSettingsPoster', () => {
  beforeEach(() => (useMediaQuery as jest.Mock).mockImplementation(() => true))

  it('shows edit poster image dialog', async () => {
    const { getByTestId } = render(
      <MockedProvider>
        <ThemeProvider>
          <SnackbarProvider>
            <VideoBlockEditorSettingsPoster
              selectedBlock={image}
              parentBlockId={video.id}
            />
          </SnackbarProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    fireEvent.click(getByTestId('posterCreateButton'))
    await waitFor(() =>
      expect(getByTestId('ImageBlockEditor')).toBeInTheDocument()
    )
  })

  it('disables edit poster image button', () => {
    const { getByRole } = render(
      <MockedProvider>
        <ThemeProvider>
          <VideoBlockEditorSettingsPoster
            selectedBlock={image}
            disabled
            parentBlockId={video.id}
          />
        </ThemeProvider>
      </MockedProvider>
    )
    expect(getByRole('button')).toBeDisabled()
  })
})
