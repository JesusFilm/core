import { render } from '@testing-library/react'
import { themes } from '@core/shared/ui'
import { TreeBlock } from '../..'
import { ThemeMode, ThemeName } from '../../../__generated__/globalTypes'
import { Card } from '.'

describe('CardBlock', () => {
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

  it('should render children', () => {
    const { getByText } = render(<Card {...block} />)
    expect(getByText('How did we get here?')).toBeInTheDocument()
  })

  it('should not render block if coverBlockId', () => {
    const { queryByText } = render(
      <Card {...block} coverBlockId="typographyBlockId" />
    )
    expect(queryByText('How did we get here?')).not.toBeInTheDocument()
  })

  it('should render card with background color', () => {
    const { getByTestId } = render(
      <Card {...block} backgroundColor="#F1A025" />
    )
    expect(getByTestId('card')).toHaveStyle('background-color: #F1A025')
  })

  it('should render card with custom theme', () => {
    const { getByTestId } = render(
      <Card {...block} themeMode={ThemeMode.dark} themeName={ThemeName.base} />
    )
    expect(getByTestId('card')).toHaveStyle(
      `background-color: ${themes.base.dark.palette.background.paper}`
    )
  })

  it('should render card with cover image', () => {
    const { getByTestId, getAllByText } = render(
      <Card
        {...{
          ...block,
          children: [
            ...block.children,
            {
              id: 'imageBlockId1',
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
          ]
        }}
        coverBlockId="imageBlockId1"
      />
    )
    expect(getByTestId('CardImageCover')).toHaveAttribute(
      'alt',
      'random image from unsplash'
    )
    expect(getAllByText('How did we get here?')[0]).toBeInTheDocument()
  })

  it('should render card with cover video', () => {
    const { getByTestId, getAllByText } = render(
      <Card
        {...{
          ...block,
          children: [
            ...block.children,
            {
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
                  id: 'posterBlockId',
                  __typename: 'ImageBlock',
                  src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920',
                  alt: 'random image from unsplash - video',
                  width: 1600,
                  height: 1067,
                  blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL',
                  parentBlockId: 'videoBlockId',
                  parentOrder: 0,
                  children: []
                }
              ]
            }
          ]
        }}
        coverBlockId="videoBlockId1"
      />
    )
    const sourceTag = getByTestId('CardCover').querySelector('.vjs-tech source')
    expect(sourceTag?.getAttribute('src')).toEqual(
      'https://arc.gt/hls/2_0-FallingPlates/529'
    )
    expect(sourceTag?.getAttribute('type')).toEqual('application/x-mpegURL')
    expect(getByTestId('VideoPosterCover')).toHaveAttribute(
      'alt',
      'random image from unsplash - video'
    )
    expect(getAllByText('How did we get here?')[0]).toBeInTheDocument()
  })
})
