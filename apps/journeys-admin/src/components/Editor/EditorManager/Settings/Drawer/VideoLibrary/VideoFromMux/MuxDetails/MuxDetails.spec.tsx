import { render } from '@testing-library/react'

import {
  VideoBlockObjectFit,
  VideoBlockSource
} from '../../../../../../../../../__generated__/globalTypes'

import { MuxDetails } from './MuxDetails'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('MuxDetails', () => {
  it('should render details of a video', async () => {
    const { getByRole } = render(
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
    const videoPlayer = getByRole('region', {
      name: 'Video Player'
    })
    const sourceTag = videoPlayer.querySelector('.vjs-tech source')
    expect(sourceTag?.getAttribute('src')).toBe(
      'https://stream.mux.com/playbackId.m3u8'
    )
    expect(sourceTag?.getAttribute('type')).toBe('application/x-mpegURL')
    const imageTag = videoPlayer.querySelector('.vjs-poster > picture > img')
    expect(imageTag?.getAttribute('src')).toBe(
      'https://image.mux.com/playbackId/thumbnail.png?time=1'
    )
  })
})
