import { TreeBlock } from '@core/journeys/ui'
import { render } from '@testing-library/react'
import { GetJourney_journey_blocks_TypographyBlock as TypographyBlock } from '../../../../../../../__generated__/GetJourney'
import {
  TypographyAlign,
  TypographyColor,
  TypographyVariant
} from '../../../../../../../__generated__/globalTypes'
import { Typography } from '.'

describe('Typography properties', () => {
  it('shows default attributes', () => {
    const block: TreeBlock<TypographyBlock> = {
      id: 'typography1.id',
      __typename: 'TypographyBlock',
      parentBlockId: null,
      align: null,
      color: null,
      content: 'Typography',
      variant: null,
      children: []
    }
    const { getByRole } = render(<Typography {...block} />)
    expect(getByRole('button', { name: 'Color Primary' })).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'Text Variant Body 2' })
    ).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'Text Alignment Left' })
    ).toBeInTheDocument()
  })

  it('shows filled attributes', () => {
    const block: TreeBlock<TypographyBlock> = {
      id: 'typography1.id',
      __typename: 'TypographyBlock',
      parentBlockId: null,
      align: TypographyAlign.center,
      color: TypographyColor.secondary,
      content: 'Typography',
      variant: TypographyVariant.h2,
      children: []
    }
    const { getByRole } = render(<Typography {...block} />)
    expect(getByRole('button', { name: 'Color Secondary' })).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'Text Variant Header 2' })
    ).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'Text Alignment Center' })
    ).toBeInTheDocument()
  })
})
