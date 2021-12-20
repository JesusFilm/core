import { render } from '@testing-library/react'

import {
  TypographyAlign,
  TypographyColor,
  TypographyVariant
} from '../../../../__generated__/globalTypes'
import { GetJourney_journey_blocks_TypographyBlock as TypographyBlock } from '../../../../__generated__/GetJourney'
import { TreeBlock } from '../../../libs/transformer/transformer'
import { Typography } from './Typography'

describe('Typography', () => {
  const block: TreeBlock<TypographyBlock> = {
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
