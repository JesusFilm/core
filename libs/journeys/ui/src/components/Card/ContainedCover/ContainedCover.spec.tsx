import { render } from '@testing-library/react'
import type { TreeBlock } from '../../../libs/block'
import { ImageFields } from '../../Image/__generated__/ImageFields'
import { VideoFields } from '../../Video/__generated__/VideoFields'
import { ContainedCover } from '.'

describe('ContainedCover', () => {
  const children = <p>How did we get here?</p>

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
    posterBlockId: 'posterBlockId',
    fullsize: null,
    action: null,
    videoId: '2_0-FallingPlates',
    videoVariantLanguageId: '529',
    source: null,
    title: null,
    description: null,
    duration: null,
    image: null,
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

  // Render children with background color or background blur overlay tested in Card VR

  it('should render image cover with image source', () => {
    const { getByTestId, getAllByText } = render(
      <ContainedCover
        backgroundColor="#DDD"
        backgroundBlur={blurUrl}
        imageBlock={imageBlock}
      >
        {children}
      </ContainedCover>
    )

    const imageCover = getByTestId('ContainedCardImageCover')

    expect(imageCover).toHaveAccessibleName(imageBlock.alt)
    expect(getAllByText('How did we get here?')[0]).toBeInTheDocument()
    expect(imageCover).toHaveAttribute(
      'src',
      'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
    )
  })

  it('should render image cover with background blur', () => {
    const { getByTestId, getAllByText } = render(
      <ContainedCover
        backgroundColor="#DDD"
        backgroundBlur={blurUrl}
        imageBlock={{ ...imageBlock, src: null }}
      >
        {children}
      </ContainedCover>
    )
    const imageCover = getByTestId('ContainedCardImageCover')

    expect(imageCover).toHaveAccessibleName(imageBlock.alt)
    expect(getAllByText('How did we get here?')[0]).toBeInTheDocument()
    expect(imageCover).toHaveAttribute('src', blurUrl)
    expect(imageCover).toHaveStyle(`background-image: url(${blurUrl})`)
  })

  it('should render video cover', () => {
    const { getByTestId, getAllByText, queryByTestId } = render(
      <ContainedCover
        backgroundColor="#DDD"
        backgroundBlur={blurUrl}
        videoBlock={videoBlock}
      >
        {children}
      </ContainedCover>
    )

    const sourceTag =
      getByTestId('ContainedCover').querySelector('.vjs-tech source')
    expect(sourceTag?.getAttribute('src')).toEqual(
      'https://arc.gt/hls/2_0-FallingPlates/529'
    )
    expect(sourceTag?.getAttribute('type')).toEqual('application/x-mpegURL')
    expect(queryByTestId('VideoPosterCover')).not.toBeInTheDocument()
    expect(getAllByText('How did we get here?')[0]).toBeInTheDocument()
  })

  it('should render video cover with poster image', () => {
    const posterBlock: TreeBlock<ImageFields> = {
      ...imageBlock,
      id: 'posterBlockId',
      parentBlockId: 'videoBlockId'
    }

    const { getByTestId, getAllByText } = render(
      <ContainedCover
        backgroundColor="#DDD"
        backgroundBlur={blurUrl}
        videoBlock={{ ...videoBlock, children: [posterBlock] }}
        imageBlock={posterBlock}
      >
        {children}
      </ContainedCover>
    )

    const sourceTag =
      getByTestId('ContainedCover').querySelector('.vjs-tech source')
    expect(sourceTag?.getAttribute('src')).toEqual(
      'https://arc.gt/hls/2_0-FallingPlates/529'
    )
    expect(sourceTag?.getAttribute('type')).toEqual('application/x-mpegURL')
    expect(getByTestId('VideoPosterCover')).toHaveAccessibleName(imageBlock.alt)
    expect(getAllByText('How did we get here?')[0]).toBeInTheDocument()
  })
})
