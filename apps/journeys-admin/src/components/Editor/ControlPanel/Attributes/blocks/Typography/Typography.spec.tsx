import { TreeBlock } from '@core/journeys/ui'
import { render } from '@testing-library/react'
import { GetJourneyForEdit_journey_blocks_TypographyBlock as TypographyBlock } from '../../../../../../../__generated__/GetJourneyForEdit'
import {
  TypographyAlign,
  TypographyColor,
  TypographyVariant
} from '../../../../../../../__generated__/globalTypes'
import { Typography } from '.'

describe('Typography', () => {
  it('shows default attributes', () => {
    const block: TreeBlock<TypographyBlock> = {
      id: 'typography1.id',
      __typename: 'TypographyBlock',
      parentBlockId: null,
      align: TypographyAlign.left,
      color: TypographyColor.primary,
      content: 'Typography',
      variant: TypographyVariant.body2,
      children: []
    }
    const { getByText } = render(<Typography {...block} />)
    expect(getByText('Primary')).toBeInTheDocument()
    expect(getByText('Body 2')).toBeInTheDocument()
    expect(getByText('Left')).toBeInTheDocument()
  })
})
