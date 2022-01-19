import { render, fireEvent } from '@testing-library/react'
import {
  TypographyAlign,
  TypographyColor,
  TypographyVariant
} from '../../../__generated__/globalTypes'
import { TreeBlock, EditorProvider } from '../..'
import { TypographyFields } from './__generated__/TypographyFields'
import { Typography } from './Typography'

const block: TreeBlock<TypographyFields> = {
  __typename: 'TypographyBlock',
  id: 'heading3',
  journeyId: 'journey1.id',
  parentBlockId: 'question',
  content: 'Hello World!',
  variant: TypographyVariant.h3,
  color: TypographyColor.primary,
  align: TypographyAlign.left,
  children: []
}

describe('Typography', () => {
  it('should render successfully', () => {
    const { getByRole } = render(<Typography {...block} />)
    expect(
      getByRole('heading', { name: 'Hello World!', level: 3 })
    ).toBeInTheDocument()
  })

  it('should render overline as paragraph', () => {
    const { getByText } = render(
      <Typography {...block} variant={TypographyVariant.overline} />
    )
    expect(getByText('Hello World!').tagName).toEqual('P')
  })

  it('should render caption as paragraph', () => {
    const { getByText } = render(
      <Typography {...block} variant={TypographyVariant.caption} />
    )
    expect(getByText('Hello World!').tagName).toEqual('P')
  })
})

describe('Admin Typography', () => {
  it('should edit text on click ', () => {
    const { getByText } = render(
      <EditorProvider
        initialState={{
          selectedBlock: {
            id: 'card0.id',
            __typename: 'CardBlock',
            journeyId: 'journey1.id',
            parentBlockId: 'step0.id',
            coverBlockId: null,
            backgroundColor: null,
            themeMode: null,
            themeName: null,
            fullscreen: false,
            children: [block]
          }
        }}
      >
        <Typography {...block} />
      </EditorProvider>
    )

    fireEvent.click(getByText(block.content))

    expect(getByText(block.content)).toHaveStyle('outline: 3px solid #C52D3A')
    // Check editable when implemented
  })
})
