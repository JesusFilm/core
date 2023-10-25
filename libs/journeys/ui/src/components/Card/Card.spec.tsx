import { render, waitFor } from '@testing-library/react'

import {
  ThemeMode,
  ThemeName,
  VideoBlockSource
} from '../../../__generated__/globalTypes'
import type { TreeBlock } from '../../libs/block'
import { blurImage } from '../../libs/blurImage'
import { ImageFields } from '../Image/__generated__/ImageFields'
import { VideoFields } from '../Video/__generated__/VideoFields'

import { Card } from '.'

jest.mock('../../libs/blurImage', () => ({
  __esModule: true,
  blurImage: jest.fn()
}))

describe('CardBlock', () => {
  beforeEach(() => {
    const blurImageMock = blurImage as jest.Mock
    blurImageMock.mockReturnValue(
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAJCAYAAAA7KqwyAAAABmJLR0QA/wD/AP+gvaeTAAABA0lEQVQokV2RMY4cQQwDi5S69x7hwP9/ngMfPDstOpiFAwcVECAqIPXz60fUxq9F7UWtRlUgmBzuuXnfF3+ui+/r4tcVcgumQIUFiHyA/7OTB0IRXgwk/2h7kEwBxVNWHpMIEMIQDskNOSjFdwQR3Q0YymCLspCFFAJYIAVxkN/IN9JCMr8R7W1k4/WhC7uQgIhocAq30Qh6gMNkCEPr1ciFeuG18VrUR6A55AhrEAdyCHBKdERJNHuBC9ZGe6NeqJoSaAZuM3pGJcNI1ARjpKKzFlTBWrAX6o26EcJzwEKEZPAcDDiDgNh0usFFqqEb1kJVjyB+XjgL1xvXwjMoNxKMzF9Ukn10nay9yQAAAABJRU5ErkJggg=='
    )
  })

  const block: TreeBlock = {
    __typename: 'CardBlock',
    id: 'card',
    parentBlockId: null,
    backgroundColor: null,
    coverBlockId: null,
    parentOrder: 0,
    themeMode: null,
    themeName: null,
    fullscreen: false,
    children: [
      {
        id: 'typographyBlockId',
        __typename: 'TypographyBlock',
        parentBlockId: null,
        parentOrder: 0,
        align: null,
        color: null,
        content: 'How did we get here?',
        variant: null,
        children: []
      }
    ]
  }

  const imageBlock: TreeBlock<ImageFields> = {
    id: 'imageBlockId',
    __typename: 'ImageBlock',
    src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920',
    alt: 'random image from unsplash',
    width: 1600,
    height: 1067,
    blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL',
    parentBlockId: 'card',
    parentOrder: 0,
    children: []
  }

  const videoBlock: TreeBlock<VideoFields> = {
    __typename: 'VideoBlock',
    id: 'videoBlockId',
    parentBlockId: 'card',
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
    children: [
      {
        ...imageBlock,
        id: 'posterBlockId',
        alt: 'random image from unsplash - video',
        parentBlockId: 'videoBlockId'
      }
    ]
  }

  it('should render card with theme background color', async () => {
    const { getByTestId, getByText } = render(<Card {...block} />)

    expect(blurImage).not.toHaveBeenCalled()
    expect(getByTestId('JourneysCard-card')).toHaveStyle(
      'background-color: #FFF'
    )
    await waitFor(() =>
      expect(getByText('How did we get here?')).toBeInTheDocument()
    )
  })

  it('should render card with override background color', () => {
    const { getByTestId } = render(
      <Card
        {...block}
        themeMode={ThemeMode.dark}
        themeName={ThemeName.base}
        backgroundColor="#F1A025"
      />
    )

    expect(blurImage).not.toHaveBeenCalled()
    expect(getByTestId('JourneysCard-card')).toHaveStyle(
      'background-color: #F1A025'
    )
  })

  it('should render expanded cover if no coverBlockId', () => {
    const { queryByText, getByTestId } = render(
      <Card {...block} coverBlockId={null} />
    )

    expect(blurImage).not.toHaveBeenCalled()
    expect(getByTestId('CardExpandedCover')).toBeInTheDocument()
    expect(queryByText('How did we get here?')).toBeInTheDocument()
  })

  it('should render expanded cover if invalid coverBlockId', () => {
    const { queryByText, getByTestId } = render(
      <Card {...block} coverBlockId="fakeId" />
    )

    expect(blurImage).not.toHaveBeenCalled()
    expect(getByTestId('CardExpandedCover')).toBeInTheDocument()
    expect(queryByText('How did we get here?')).toBeInTheDocument()
  })

  it('should render expanded cover with blur image background', async () => {
    const { queryByText, getByTestId } = render(
      <Card
        {...{ ...block, children: [...block.children, imageBlock] }}
        fullscreen
        coverBlockId="imageBlockId"
      />
    )

    expect(blurImage).toHaveBeenCalledWith(imageBlock.blurhash, '#fff')
    expect(getByTestId('CardExpandedCover')).toBeInTheDocument()
    await waitFor(() =>
      expect(getByTestId('CardExpandedImageCover')).toBeInTheDocument()
    )
    expect(queryByText('How did we get here?')).toBeInTheDocument()
  })

  it('should render contained cover with image cover', () => {
    const { queryByTestId, queryAllByText } = render(
      <Card
        {...{ ...block, children: [...block.children, imageBlock] }}
        coverBlockId="imageBlockId"
      />
    )
    const standaloneImageBlock = queryByTestId(`JourneysImage-${imageBlock.id}`)

    expect(blurImage).toHaveBeenCalledWith(imageBlock.blurhash, '#fff')
    expect(queryByTestId('CardContainedCover')).toBeInTheDocument()
    expect(queryByTestId('background-image')).toHaveAccessibleName(
      'random image from unsplash'
    )
    expect(standaloneImageBlock).not.toBeInTheDocument()
    expect(queryAllByText('How did we get here?')[0]).toBeInTheDocument()
  })

  it('should render contained cover with video cover', () => {
    const { queryByTestId, queryAllByText } = render(
      <Card
        {...{ ...block, children: [...block.children, videoBlock] }}
        coverBlockId="videoBlockId"
      />
    )
    const standaloneVideoBlock = queryByTestId(`JourneysVideo-${videoBlock.id}`)

    expect(queryByTestId('CardContainedCover')).toBeInTheDocument()
    expect(queryByTestId('video-poster-image')).toHaveAccessibleName(
      'card video image'
    )
    expect(standaloneVideoBlock).not.toBeInTheDocument()
    expect(queryAllByText('How did we get here?')[0]).toBeInTheDocument()
  })
})
