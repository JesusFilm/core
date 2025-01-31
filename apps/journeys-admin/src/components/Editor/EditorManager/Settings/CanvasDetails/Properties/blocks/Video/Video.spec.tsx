import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import { BlockFields_VideoBlock as VideoBlock } from '../../../../../../../../../__generated__/BlockFields'
import { VideoBlockSource } from '../../../../../../../../../__generated__/globalTypes'
import { TestEditorState } from '../../../../../../../../libs/TestEditorState'

import { Video } from './Video'

describe('Video', () => {
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

  it('should display Video Options', () => {
    const { getByText } = render(
      <MockedProvider>
        <SnackbarProvider>
          <Video {...video} />
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(getByText('Video Source')).toBeInTheDocument()
    expect(getByText('FallingPlates')).toBeInTheDocument()
  })

  it('should open property drawer for video options', () => {
    const { getByText } = render(
      <MockedProvider>
        <SnackbarProvider>
          <EditorProvider>
            <Video {...video} />
            <TestEditorState />
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(
      getByText('selectedAttributeId: video1.id-video-options')
    ).toBeInTheDocument()
  })
})
