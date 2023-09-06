import { render, waitFor } from '@testing-library/react'

import { VideoBlockSource } from '../../../../__generated__/globalTypes'
import type { TreeBlock } from '../../../libs/block'
import { ImageFields } from '../../Image/__generated__/ImageFields'
import { VideoFields } from '../../Video/__generated__/VideoFields'

import { ContainedCover } from '.'

describe('ContainedCover', () => {
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

  const minifiedUnsplashImage =
    'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

  // Render children with background color or background blur overlay tested in Card VR

  it('should render children', () => {
    const { getByTestId, getAllByText } = render(
      <ContainedCover backgroundColor="#DDD">{children}</ContainedCover>
    )

    expect(getByTestId('overlay-blur')).toBeInTheDocument()
    expect(getByTestId('overlay-gradient')).toBeInTheDocument()
    expect(getAllByText('How did we get here?')[0]).toBeInTheDocument()
  })

  it('should render background image with image source', () => {
    const { getByTestId } = render(
      <ContainedCover
        backgroundColor="#DDD"
        backgroundBlur={blurUrl}
        imageBlock={imageBlock}
      >
        {children}
      </ContainedCover>
    )

    const imageCover = getByTestId('background-image')

    expect(imageCover).toHaveAccessibleName(imageBlock.alt)
    expect(imageCover).toHaveAttribute('src', minifiedUnsplashImage)
  })

  it('should render background image with blur url', () => {
    const { getByTestId } = render(
      <ContainedCover
        backgroundColor="#DDD"
        backgroundBlur={blurUrl}
        imageBlock={{ ...imageBlock, src: null }}
      >
        {children}
      </ContainedCover>
    )
    const imageCover = getByTestId('background-image')

    expect(imageCover).toHaveAccessibleName(imageBlock.alt)
    expect(imageCover).toHaveAttribute('src', blurUrl)
    expect(imageCover).toHaveStyle(`background-image: url(${blurUrl})`)
  })

  it('should render background video with custom poster image', async () => {
    const { getByTestId, getByRole } = render(
      <ContainedCover
        backgroundColor="#DDD"
        backgroundBlur={blurUrl}
        videoBlock={{
          ...videoBlock,
          children: [imageBlock],
          posterBlockId: imageBlock.id
        }}
      >
        {children}
      </ContainedCover>
    )

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

  it('should render background video with video.image', () => {
    const { getByTestId, getByRole } = render(
      <ContainedCover
        backgroundColor="#DDD"
        backgroundBlur={blurUrl}
        videoBlock={{ ...videoBlock, source: VideoBlockSource.cloudflare }}
      >
        {children}
      </ContainedCover>
    )

    const source = getByRole('region', { name: 'Video Player' }).querySelector(
      '.vjs-tech source'
    )
    expect(source).toHaveAttribute(
      'src',
      'https://customer-.cloudflarestream.com/2_0-FallingPlates/manifest/video.m3u8'
    )
    expect(source).toHaveAttribute('type', 'application/x-mpegURL')

    const posterImage = getByTestId('video-poster-image')

    expect(posterImage).toHaveAccessibleName('card video image')
    expect(posterImage).toHaveAttribute('aria-details', videoBlock.video?.image)
  })

  it('should not show black loading square for background video on embedded card', () => {
    const { getByRole } = render(
      <ContainedCover
        backgroundColor="#DDD"
        backgroundBlur={blurUrl}
        videoBlock={{ ...videoBlock, source: VideoBlockSource.cloudflare }}
      >
        {children}
      </ContainedCover>
    )

    const syledVideoComponent = getByRole('region', { name: 'Video Player' })
    expect(syledVideoComponent).toHaveClass('vjs-fill')
  })

  it('should render background video with default youtube thumbnail image', () => {
    const { getByTestId, getByRole } = render(
      <ContainedCover
        backgroundColor="#DDD"
        backgroundBlur={blurUrl}
        videoBlock={{
          ...videoBlock,
          source: VideoBlockSource.youTube,
          image: 'http://youtube.thumbnail.image'
        }}
      >
        {children}
      </ContainedCover>
    )

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
})
