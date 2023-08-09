import { render } from '@testing-library/react'

import { TreeBlock } from '@core/journeys/ui/block'

import { VideoBlockSource } from '../../../../__generated__/globalTypes'
import { ImageFields as ImageBlock } from '../../../../__generated__/ImageFields'
import { VideoFields as VideoBlock } from '../../../../__generated__/VideoFields'

import { VideoWrapper } from './VideoWrapper'

describe('VideoWrapper', () => {
  const imageBlock: TreeBlock<ImageBlock> = {
    id: 'posterBlockId',
    __typename: 'ImageBlock',
    src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920',
    alt: 'random image from unsplash',
    width: 1600,
    height: 1067,
    blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL',
    parentBlockId: 'video0.id',
    parentOrder: 0,
    children: []
  }

  const videoBlock: TreeBlock<VideoBlock> = {
    __typename: 'VideoBlock',
    id: 'video0.id',
    parentBlockId: '',
    parentOrder: 0,
    autoplay: true,
    startAt: 10,
    endAt: null,
    muted: null,
    posterBlockId: 'posterBlockId',
    fullsize: null,
    action: null,
    videoId: '2_0-FallingPlates',
    videoVariantLanguageId: '529',
    source: VideoBlockSource.internal,
    title: null,
    description: null,
    duration: null,
    image: null,
    objectFit: null,
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
    children: []
  }

  it('should render the posterBlock image', () => {
    const { getByAltText } = render(
      <VideoWrapper block={{ ...videoBlock, children: [imageBlock] }} />
    )
    expect(getByAltText('random image from unsplash')).toBeInTheDocument()
  })

  it('should render internal video', async () => {
    const { getByTestId } = render(<VideoWrapper block={videoBlock} />)
    const sourceTag =
      getByTestId('video-video0.id').querySelector('.vjs-tech source')
    expect(sourceTag?.getAttribute('src')).toBe(
      'https://arc.gt/hls/2_0-FallingPlates/529'
    )
    expect(sourceTag?.getAttribute('type')).toBe('application/x-mpegURL')
  })

  it('should render cloudflare video', () => {
    const { getByTestId } = render(
      <VideoWrapper
        block={{
          ...videoBlock,
          source: VideoBlockSource.cloudflare,
          videoId: 'videoId'
        }}
      />
    )
    const sourceTag =
      getByTestId('video-video0.id').querySelector('.vjs-tech source')
    expect(sourceTag?.getAttribute('src')).toBe(
      'https://customer-.cloudflarestream.com/videoId/manifest/video.m3u8'
    )
    expect(sourceTag?.getAttribute('type')).toBe('application/x-mpegURL')
  })

  it('should render youtube video', () => {
    const { getByTestId } = render(
      <VideoWrapper
        block={{
          ...videoBlock,
          videoId: 'F7k5pqBVinA',
          source: VideoBlockSource.youTube
        }}
      />
    )
    const sourceTag =
      getByTestId('video-video0.id').querySelector('.vjs-tech source')
    expect(sourceTag?.getAttribute('src')).toBe(
      'https://www.youtube.com/embed/F7k5pqBVinA?start=10&end=0'
    )
    expect(sourceTag?.getAttribute('type')).toBe('video/youtube')
  })

  it('should render placeholder icon if VideoId is null and there is no posterBlock', () => {
    const { getByTestId } = render(
      <VideoWrapper block={{ ...videoBlock, videoId: null, children: [] }} />
    )
    expect(getByTestId('VideocamRoundedIcon')).toHaveClass('MuiSvgIcon-root')
  })
})
