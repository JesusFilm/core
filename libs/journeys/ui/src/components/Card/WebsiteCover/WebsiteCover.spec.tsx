import { render, waitFor } from '@testing-library/react'

import { VideoBlockSource } from '../../../../__generated__/globalTypes'
import type { TreeBlock } from '../../../libs/block'
import { BlockFields_VideoBlock_mediaVideo_Video } from '../../../libs/block/__generated__/BlockFields'
import { ImageFields } from '../../Image/__generated__/ImageFields'
import { VideoFields } from '../../Video/__generated__/VideoFields'

import { WebsiteCover } from '.'

describe('WebsiteCover', () => {
  const children = [<p key="content">How did we get here?</p>]

  const blurUrl =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAJCAYAAAA7KqwyAAAABmJLR0QA/wD/AP+gvaeTAAABA0lEQVQokV2RMY4cQQwDi5S69x7hwP9/ngMfPDstOpiFAwcVECAqIPXz60fUxq9F7UWtRlUgmBzuuXnfF3+ui+/r4tcVcgumQIUFiHyA/7OTB0IRXgwk/2h7kEwBxVNWHpMIEMIQDskNOSjFdwQR3Q0YymCLspCFFAJYIAVxkN/IN9JCMr8R7W1k4/WhC7uQgIhocAq30Qh6gMNkCEPr1ciFeuG18VrUR6A55AhrEAdyCHBKdERJNHuBC9ZGe6NeqJoSaAZuM3pGJcNI1ARjpKKzFlTBWrAX6o26EcJzwEKEZPAcDDiDgNh0usFFqqEb1kJVjyB+XjgL1xvXwjMoNxKMzF9Ukn10nay9yQAAAABJRU5ErkJggg=='

  const imageBlock: TreeBlock<ImageFields> = {
    id: 'image1.id',
    __typename: 'ImageBlock',
    src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920',
    blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL',
    width: 1920,
    height: 1080,
    alt: 'random image from unsplash',
    parentBlockId: 'card1.id',
    parentOrder: 0,
    scale: null,
    focalLeft: 50,
    focalTop: 50,
    customizable: null,
    children: []
  }

  const videoBlock: TreeBlock<VideoFields> = {
    __typename: 'VideoBlock',
    id: 'videoBlockId1',
    parentBlockId: null,
    parentOrder: 0,
    muted: true,
    autoplay: true,
    startAt: null,
    endAt: null,
    posterBlockId: null,
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
    showGeneratedSubtitles: null,
    subtitleLanguage: null,
    eventLabel: null,
    endEventLabel: null,
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
    customizable: null,
    children: []
  }

  it('should render children', () => {
    const { getByTestId, getByText } = render(
      <WebsiteCover backgroundColor="#DDD">{children}</WebsiteCover>
    )

    expect(getByTestId('website-cover')).toBeInTheDocument()
    expect(getByTestId('website-cover-content')).toBeInTheDocument()
    expect(getByText('How did we get here?')).toBeInTheDocument()
  })

  it('should render with correct container styles', () => {
    const { getByTestId } = render(
      <WebsiteCover backgroundColor="#DDD">{children}</WebsiteCover>
    )

    const cover = getByTestId('website-cover')

    expect(cover).toHaveStyle({
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'scroll',
      overflowX: 'hidden',
      backgroundColor: '#DDD',
      scrollbarWidth: 'none'
    })
  })

  it('should render image section with image source', () => {
    const { getByTestId } = render(
      <WebsiteCover
        backgroundColor="#DDD"
        backgroundBlur={blurUrl}
        imageBlock={imageBlock}
      >
        {children}
      </WebsiteCover>
    )

    expect(getByTestId('website-cover-image')).toBeInTheDocument()
  })

  it('should render image section with blur url when src is null', () => {
    const { getByTestId } = render(
      <WebsiteCover
        backgroundColor="#DDD"
        backgroundBlur={blurUrl}
        imageBlock={{ ...imageBlock, src: null }}
      >
        {children}
      </WebsiteCover>
    )

    expect(getByTestId('website-cover-image')).toBeInTheDocument()
  })

  it('should not render image section when backgroundBlur is not provided', () => {
    const { queryByTestId } = render(
      <WebsiteCover backgroundColor="#DDD" imageBlock={imageBlock}>
        {children}
      </WebsiteCover>
    )

    expect(queryByTestId('website-cover-image')).not.toBeInTheDocument()
  })

  it('should render video section with custom poster image', async () => {
    const { getByTestId, getByRole } = render(
      <WebsiteCover
        backgroundColor="#DDD"
        backgroundBlur={blurUrl}
        videoBlock={{
          ...videoBlock,
          children: [imageBlock],
          posterBlockId: imageBlock.id
        }}
      >
        {children}
      </WebsiteCover>
    )

    expect(getByTestId('website-cover-video')).toBeInTheDocument()

    const source = await waitFor(() =>
      getByRole('region', { name: 'Video Player' }).querySelector(
        '.vjs-tech source'
      )
    )
    expect(source).toHaveAttribute(
      'src',
      'https://arc.gt/hls/2_0-FallingPlates/529'
    )
    expect(source).toHaveAttribute('type', 'application/x-mpegURL')

    const posterImage = getByTestId('video-poster-image')

    expect(posterImage).toHaveAccessibleName('card video image')
    expect(posterImage).toHaveAttribute('aria-details', imageBlock.src)
  })

  it('should render video section with videoBlock.video.image', () => {
    const { getByTestId, getByRole } = render(
      <WebsiteCover
        backgroundColor="#DDD"
        backgroundBlur={blurUrl}
        videoBlock={{ ...videoBlock }}
      >
        {children}
      </WebsiteCover>
    )

    expect(getByTestId('website-cover-video')).toBeInTheDocument()

    const source = getByRole('region', { name: 'Video Player' }).querySelector(
      '.vjs-tech source'
    )
    expect(source).toHaveAttribute(
      'src',
      'https://arc.gt/hls/2_0-FallingPlates/529'
    )
    expect(source).toHaveAttribute('type', 'application/x-mpegURL')

    const posterImage = getByTestId('video-poster-image')

    expect(posterImage).toHaveAccessibleName('card video image')
    expect(posterImage).toHaveAttribute(
      'aria-details',
      (videoBlock.mediaVideo as BlockFields_VideoBlock_mediaVideo_Video)
        ?.images[0]?.mobileCinematicHigh
    )
  })

  it('should render video section with default mux thumbnail image', () => {
    const { getByTestId, getByRole } = render(
      <WebsiteCover
        backgroundColor="#DDD"
        backgroundBlur={blurUrl}
        videoBlock={{
          ...videoBlock,
          source: VideoBlockSource.mux,
          mediaVideo: {
            __typename: 'MuxVideo',
            id: '2_0-FallingPlates',
            assetId: '2_0-FallingPlates',
            playbackId: '2_0-FallingPlates'
          },
          image: 'https://stream.mux.com/2_0-FallingPlates.m3u8'
        }}
      >
        {children}
      </WebsiteCover>
    )

    expect(getByTestId('website-cover-video')).toBeInTheDocument()

    const source = getByRole('region', { name: 'Video Player' }).querySelector(
      '.vjs-tech source'
    )
    expect(source).toHaveAttribute(
      'src',
      'https://stream.mux.com/2_0-FallingPlates.m3u8'
    )
    expect(source).toHaveAttribute('type', 'application/x-mpegURL')

    const posterImage = getByTestId('video-poster-image')

    expect(posterImage).toHaveAccessibleName('card video image')
    expect(posterImage).toHaveAttribute(
      'aria-details',
      'https://stream.mux.com/2_0-FallingPlates.m3u8'
    )
  })

  it('should render video section with default youtube thumbnail image', () => {
    const { getByTestId, getByRole } = render(
      <WebsiteCover
        backgroundColor="#DDD"
        backgroundBlur={blurUrl}
        videoBlock={{
          ...videoBlock,
          source: VideoBlockSource.youTube,
          mediaVideo: {
            __typename: 'YouTube',
            id: '2_0-FallingPlates'
          },
          image: 'http://youtube.thumbnail.image'
        }}
      >
        {children}
      </WebsiteCover>
    )

    expect(getByTestId('website-cover-video')).toBeInTheDocument()

    const source = getByRole('region', {
      name: 'Video Player'
    }).querySelector('.vjs-tech source')
    expect(source).toHaveAttribute(
      'src',
      'https://www.youtube.com/embed/2_0-FallingPlates?start=0&end=0'
    )
    expect(source).toHaveAttribute('type', 'video/youtube')

    const posterImage = getByTestId('video-poster-image')

    expect(posterImage).toHaveAccessibleName('card video image')
    expect(posterImage).toHaveAttribute(
      'aria-details',
      'http://youtube.thumbnail.image'
    )
  })

  it('should apply YouTube scale transform to poster image', () => {
    const { getByTestId } = render(
      <WebsiteCover
        backgroundColor="#DDD"
        backgroundBlur={blurUrl}
        videoBlock={{
          ...videoBlock,
          source: VideoBlockSource.youTube,
          mediaVideo: {
            __typename: 'YouTube',
            id: '2_0-FallingPlates'
          },
          image: 'http://youtube.thumbnail.image'
        }}
      >
        {children}
      </WebsiteCover>
    )

    const posterImage = getByTestId('video-poster-image')

    expect(posterImage).toHaveStyle({
      transform: 'scale(2)'
    })
  })

  it('should strip alpha from hex background color', () => {
    const { getByTestId } = render(
      <WebsiteCover backgroundColor="#DDDFFFFF">{children}</WebsiteCover>
    )

    const cover = getByTestId('website-cover')

    expect(cover).toHaveStyle({
      backgroundColor: '#DDDFFF'
    })
  })

  it('should render both video and image sections when both are provided', () => {
    const { getByTestId } = render(
      <WebsiteCover
        backgroundColor="#DDD"
        backgroundBlur={blurUrl}
        videoBlock={videoBlock}
        imageBlock={imageBlock}
      >
        {children}
      </WebsiteCover>
    )

    expect(getByTestId('website-cover-video')).toBeInTheDocument()
    expect(getByTestId('website-cover-image')).toBeInTheDocument()
  })

  it('should pass hasFullscreenVideo prop to OverlayContent', () => {
    const { getByTestId } = render(
      <WebsiteCover backgroundColor="#DDD" hasFullscreenVideo>
        {children}
      </WebsiteCover>
    )

    expect(getByTestId('website-cover-content')).toBeInTheDocument()
  })
})
