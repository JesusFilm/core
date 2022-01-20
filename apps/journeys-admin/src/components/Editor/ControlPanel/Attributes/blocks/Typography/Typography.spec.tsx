import { TreeBlock } from '@core/journeys/ui'
import { render } from '@testing-library/react'
import { GetJourneyForEdit_adminJourney_blocks_TypographyBlock as TypographyBlock } from '../../../../../../../__generated__/GetJourneyForEdit'
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
    const { getByText } = render(<Typography {...block} />)
    expect(getByText('Primary')).toBeInTheDocument()
    expect(getByText('Body 2')).toBeInTheDocument()
    expect(getByText('Left')).toBeInTheDocument()
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
    const { getByText } = render(<Typography {...block} />)
    expect(getByText('Secondary')).toBeInTheDocument()
    expect(getByText('Header 2')).toBeInTheDocument()
    expect(getByText('Center')).toBeInTheDocument()
  })
})
