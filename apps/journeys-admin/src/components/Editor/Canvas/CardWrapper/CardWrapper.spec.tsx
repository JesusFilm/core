import { render } from '@testing-library/react'
import { themes } from '@core/shared/ui'
import { TreeBlock } from '@core/journeys/ui'
import { MockedProvider } from '@apollo/client/testing'
import { ThemeName, ThemeMode } from '../../../../../__generated__/globalTypes'
import { CardWrapper } from '.'

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
    const { getByText } = render(<CardWrapper block={block} />)
    expect(getByText('How did we get here?')).toBeInTheDocument()
  })

  it('should not render block if coverBlockId', () => {
    const { queryByText } = render(
      <CardWrapper block={{ ...block, coverBlockId: 'typographyBlockId' }} />
    )
    expect(queryByText('How did we get here?')).not.toBeInTheDocument()
  })

  it('should render card with background color', () => {
    const { getByTestId } = render(
      <CardWrapper block={{ ...block, backgroundColor: '#F1A025' }} />
    )
    expect(getByTestId('card')).toHaveStyle('background-color: #F1A025')
  })

  it('should render card with custom theme', () => {
    const { getByTestId } = render(
      <CardWrapper
        block={{
          ...block,
          themeMode: ThemeMode.dark,
          themeName: ThemeName.base
        }}
      />
    )
    expect(getByTestId('card')).toHaveStyle(
      `background-color: ${themes.base.dark.palette.background.paper}`
    )
  })

  it('should render card with cover image', () => {
    const { getByTestId, getAllByText } = render(
      <CardWrapper
        block={{
          ...{
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
          },
          coverBlockId: 'imageBlockId1'
        }}
      />
    )
    expect(getByTestId('CardImageCover')).toHaveStyle(
      'background-image: url(https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920)'
    )
    expect(getAllByText('How did we get here?')[0]).toBeInTheDocument()
  })

  it('should render the default video icon', () => {
    const { getByTestId, getAllByText } = render(
      <MockedProvider>
        <CardWrapper
          block={{
            ...block,
            children: [
              ...block.children,
              {
                __typename: 'VideoBlock',
                id: 'video0.id',
                parentBlockId: 'card',
                parentOrder: 0,
                autoplay: false,
                title: 'Video',
                startAt: 10,
                endAt: null,
                muted: null,
                fullsize: null,
                posterBlockId: 'posterBlockId',
                videoContent: {
                  __typename: 'VideoArclight',
                  src: null
                },
                children: []
              }
            ]
          }}
        />
      </MockedProvider>
    )
    expect(getByTestId('VideocamRoundedIcon')).toHaveClass('MuiSvgIcon-root')
    expect(getAllByText('How did we get here?')[0]).toBeInTheDocument()
  })
})
