import { render, screen } from '@testing-library/react'

import {
  TypographyAlign,
  TypographyColor,
  TypographyVariant
} from '../../../__generated__/globalTypes'
import type { TreeBlock } from '../../libs/block'

import { TypographyFields } from './__generated__/TypographyFields'
import { Typography } from './Typography'

const block: TreeBlock<TypographyFields> = {
  __typename: 'TypographyBlock',
  id: 'heading3',
  parentBlockId: 'question',
  parentOrder: 0,
  content: 'Hello World!',
  variant: TypographyVariant.h3,
  color: TypographyColor.primary,
  align: TypographyAlign.left,
  children: []
,
  settings: {
    __typename: 'TypographyBlockSettings',
    color: null
  }
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
    expect(getByText('Hello World!').tagName).toBe('P')
  })

  it('should render caption as paragraph', () => {
    const { getByText } = render(
      <Typography {...block} variant={TypographyVariant.caption} />
    )
    expect(getByText('Hello World!').tagName).toBe('P')
  })

  it('should render placholder text if content is empty', () => {
    const emptyContentMock = {
      ...block,
      content: '',
      placeholderText: 'Add your text here...'
    }

    render(<Typography {...emptyContentMock} />)

    expect(
      screen.getByRole('heading', { name: 'Add your text here...', level: 3 })
    ).toHaveTextContent('Add your text here...')
  })

  it('should render editable content text', () => {
    const editableContent = <>hello</>
    const emptyContentMock = {
      ...block,
      content: '',
      placeholderText: 'Add your text here...',
      editableContent
    }

    render(<Typography {...emptyContentMock} />)

    expect(
      screen.getByRole('heading', { name: 'hello', level: 3 })
    ).toHaveTextContent('hello')
  })
})
