import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen } from '@testing-library/react'

import { VideoBlockSource } from '../../../__generated__/globalTypes'
import type { TreeBlock } from '../../libs/block'
import { EditorProvider } from '../../libs/EditorProvider'
import { JourneyProvider } from '../../libs/JourneyProvider'

import { VideoFields } from './__generated__/VideoFields'

import { Video } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

const block: TreeBlock<VideoFields> = {
  __typename: 'VideoBlock',
  id: 'video0.id',
  parentBlockId: '',
  parentOrder: 0,
  autoplay: false,
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
  children: [
    {
      id: 'posterBlockId',
      __typename: 'ImageBlock',
      src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920',
      alt: 'random image from unsplash',
      width: 1600,
      height: 1067,
      blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL',
      parentBlockId: 'video0.id',
      parentOrder: 0,
      scale: null,
      focalLeft: 50,
      focalTop: 50,
      children: []
    }
  ]
}

describe('Video', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render internal video', () => {
    render(
      <MockedProvider>
        <Video {...block} />
      </MockedProvider>
    )
    const sourceTag = screen
      .getByTestId('JourneysVideo-video0.id')
      .querySelector('.vjs-tech source')
    expect(sourceTag?.getAttribute('src')).toBe(
      'https://arc.gt/hls/2_0-FallingPlates/529'
    )
    expect(sourceTag?.getAttribute('type')).toBe('application/x-mpegURL')
  })

  it('should render a YouTube video', () => {
    render(
      <MockedProvider>
        <Video
          {...{
            ...block,
            source: VideoBlockSource.youTube,
            videoId: 'videoId',
            mediaVideo: {
              __typename: 'YouTube',
              id: 'videoId'
            }
          }}
        />
      </MockedProvider>
    )
    const sourceTag = screen
      .getByTestId('JourneysVideo-video0.id')
      .querySelector('.vjs-tech source')
    expect(sourceTag?.getAttribute('src')).toBe(
      'https://www.youtube.com/embed/videoId?start=10&end=10000'
    )
    expect(sourceTag?.getAttribute('type')).toBe('video/youtube')
  })

  it('should render mux video', () => {
    render(
      <MockedProvider>
        <Video
          {...{
            ...block,
            source: VideoBlockSource.mux,
            videoId: 'videoId',
            startAt: null,
            mediaVideo: {
              __typename: 'MuxVideo',
              id: 'videoId',
              assetId: 'videoId',
              playbackId: 'videoId'
            }
          }}
        />
      </MockedProvider>
    )
    const sourceTag = screen
      .getByTestId('JourneysVideo-video0.id')
      .querySelector('.vjs-tech source')
    expect(sourceTag?.getAttribute('src')).toBe(
      `https://stream.mux.com/videoId.m3u8?asset_start_time=${0}&asset_end_time=${10000}`
    )
    expect(sourceTag?.getAttribute('type')).toBe('application/x-mpegURL')
  })

  it('should render mux video with startAt and endAt', () => {
    const endAt = 50

    render(
      <MockedProvider>
        <Video
          {...{
            ...block,
            source: VideoBlockSource.mux,
            videoId: 'videoId',
            endAt,
            mediaVideo: {
              __typename: 'MuxVideo',
              id: 'videoId',
              assetId: 'videoId',
              playbackId: 'videoId'
            }
          }}
        />
      </MockedProvider>
    )
    const sourceTag = screen
      .getByTestId('JourneysVideo-video0.id')
      .querySelector('.vjs-tech source')
    expect(sourceTag?.getAttribute('src')).toBe(
      `https://stream.mux.com/videoId.m3u8?asset_start_time=${block.startAt}&asset_end_time=${endAt}`
    )
    expect(sourceTag?.getAttribute('type')).toBe('application/x-mpegURL')
  })

  it('should render poster block image', () => {
    render(
      <MockedProvider>
        <Video {...block} />
      </MockedProvider>
    )
    const posterBlockImage = screen.getByRole('img')
    expect(posterBlockImage).toHaveAttribute(
      'alt',
      'random image from unsplash'
    )
  })

  it('should render video image when posterBlockId is null', () => {
    render(
      <MockedProvider>
        <Video {...block} posterBlockId={null} />
      </MockedProvider>
    )
    const videoImage = screen.getByRole('img')
    // video image alt is set to video image
    expect(videoImage).toHaveAttribute('alt', 'video image')
  })

  it('should not render an image if videoId is null', () => {
    render(
      <MockedProvider>
        <Video {...block} videoId={null} />
      </MockedProvider>
    )
    expect(screen.getByTestId('VideocamRoundedIcon')).toHaveClass(
      'MuiSvgIcon-root'
    )
  })

  it('should not render video image if source is YouTube and not in Next Steps Admin', () => {
    render(
      <MockedProvider>
        <Video
          {...{
            ...block,
            source: VideoBlockSource.youTube,
            videoId: 'videoId'
          }}
          posterBlockId={null}
        />
      </MockedProvider>
    )
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('should render video image if source is YouTube and in Next Steps Admin', () => {
    render(
      <JourneyProvider value={{ variant: 'admin' }}>
        <Video
          {...{
            ...block,
            source: VideoBlockSource.youTube,
            image: 'https://i.ytimg.com/vi/id/hqdefault.jpg'
          }}
          posterBlockId={null}
        />
      </JourneyProvider>
    )
    const videoImage = screen.getByRole('img')
    // video image alt is set to video image
    expect(videoImage).toHaveAttribute('alt', 'video image')
  })
})

describe.skip('Admin Video', () => {
  it('should select video on click', () => {
    const { getByRole, getByTestId } = render(
      <MockedProvider mocks={[]}>
        <EditorProvider
          initialState={{
            selectedBlock: {
              id: 'card0.id',
              __typename: 'CardBlock',
              parentBlockId: 'step0.id',
              parentOrder: 0,
              coverBlockId: null,
              backgroundColor: null,
              themeMode: null,
              themeName: null,
              fullscreen: false,
              backdropBlur: null,
              children: [block]
            }
          }}
        >
          <Video {...block} />
        </EditorProvider>
      </MockedProvider>
    )
    const video = getByRole('region', { name: 'Video Player' })

    fireEvent.click(getByTestId('JourneysVideo-video0.id'))
    expect(getByTestId('JourneysVideo-video0.id')).toHaveStyle(
      'outline: 2px solid #C52D3A'
    )
    expect(video).toHaveClass('vjs-paused')
  })

  it('should set container to 16:9', () => {
    const { getByTestId } = render(<Video {...block} />)

    // Expect container to have 16:9 aspect ratio
    expect(getByTestId('video-container')).toHaveStyle('position: absolute')
    expect(getByTestId('video-container')).toHaveStyle(
      'margin-left: calc((100vh * 16 / 9) * -0.355)'
    )
    expect(getByTestId('video-container')).toHaveStyle('overflow: hidden')

    // Jest height/width are not rendered by jest dom for testing
  })
})
