import { render } from '@testing-library/react'
import {
  TypographyAlign,
  TypographyColor,
  TypographyVariant
} from '../../../__generated__/globalTypes'
import { TreeBlock } from '../..'
import { TypographyFields } from './__generated__/TypographyFields'
import { Typography } from './Typography'

describe('Typography', () => {
  const block: TreeBlock<TypographyFields> = {
    __typename: 'TypographyBlock',
    id: 'heading3',
    parentBlockId: 'question',
    content: 'Hello World!',
    variant: TypographyVariant.h3,
    color: TypographyColor.primary,
    align: TypographyAlign.left,
    children: []
  }

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
