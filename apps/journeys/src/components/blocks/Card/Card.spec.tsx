import { render } from '../../../../test/testingLibrary'
import { Card } from '.'
import { TreeBlock } from '../../../libs/transformer/transformer'
import { ThemeMode, ThemeName } from '../../../../__generated__/globalTypes'
import { themes } from '@core/shared/ui'

describe('CardBlock', () => {
  const block: TreeBlock = {
    __typename: 'CardBlock',
    id: 'card',
    parentBlockId: null,
    backgroundColor: null,
    coverBlockId: null,
    themeMode: null,
    themeName: null,
    fullscreen: false,
    children: [
      {
        id: 'typographyBlockId',
        __typename: 'TypographyBlock',
        parentBlockId: null,
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
              children: []
            }
          ]
        }}
        coverBlockId="imageBlockId1"
      />
    )
    expect(getByTestId('CardCover')).toHaveStyle(
      'background-image: url(https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920)'
    )
    expect(getAllByText('How did we get here?')[0]).toBeInTheDocument()
  })
})
