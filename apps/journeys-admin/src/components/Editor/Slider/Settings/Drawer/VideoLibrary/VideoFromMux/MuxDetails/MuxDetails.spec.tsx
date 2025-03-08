import { render, screen } from '@testing-library/react'

import {
  VideoBlockObjectFit,
  VideoBlockSource
} from '../../../../../../../../../__generated__/globalTypes'

import { MuxDetails } from './MuxDetails'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

// Mock MuxPlayer component
jest.mock('@mux/mux-player-react', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(({ playbackId, poster }) => (
    <div
      data-testid="mux-player"
      data-playback-id={playbackId}
      data-poster={poster}
    >
      Mux Player
    </div>
  ))
}))

describe('MuxDetails', () => {
  it('should render details of a video', async () => {
    render(
      <MuxDetails
        activeVideoBlock={{
          __typename: 'VideoBlock',
          id: 'videoId',
          parentBlockId: 'parentBlockId',
          parentOrder: 0,
          muted: false,
          autoplay: false,
          startAt: 0,
          endAt: 10,
          posterBlockId: null,
          fullsize: true,
          children: [],
          videoId: 'videoId',
          videoVariantLanguageId: null,
          source: VideoBlockSource.mux,
          title: 'title',
          description: null,
          image: null,
          duration: 10,
          objectFit: VideoBlockObjectFit.fill,
          action: null,
          mediaVideo: {
            __typename: 'MuxVideo',
            id: 'videoId',
            assetId: 'assetId',
            playbackId: 'playbackId'
          }
        }}
        open
        onSelect={jest.fn()}
      />
    )

    const muxPlayer = screen.getByTestId('mux-player')
    expect(muxPlayer).toBeInTheDocument()
    expect(muxPlayer).toHaveAttribute('data-playback-id', 'playbackId')
    expect(muxPlayer).toHaveAttribute(
      'data-poster',
      'https://image.mux.com/playbackId/thumbnail.png?time=1'
    )
  })
})
