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

  it('should render card with coverBlockId', () => {
    const { getByRole } = render(
      <Card
        {...{
          ...block,
          children: [
            ...block.children,
            {
              id: 'imageBlockId1',
              __typename: 'ImageBlock',
              src: 'https://images.unsplash.com/photo-1521904764098-e4e0a87e3ce0?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=1080&ixid=MnwxfDB8MXxyYW5kb218MHx8Y2lyY2xlfHx8fHx8MTYzMzA2MjI4MQ&ixlib=rb-1.2.1&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1920',
              width: 1600,
              height: 1067,
              alt: 'random image from unsplash',
              parentBlockId: 'Image1',
              children: []
            }
          ]
        }}
        coverBlockId="imageBlockId1"
      />
    )
    expect(getByRole('img')).toHaveAttribute(
      'alt',
      'random image from unsplash'
    )
  })
})
