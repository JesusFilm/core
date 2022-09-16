import type { TreeBlock } from '@core/journeys/ui/block'
import { render } from '@testing-library/react'
import { GetJourney_journey_blocks_TextResponseBlock as TextResponseBlock } from '../../../../../../../__generated__/GetJourney'
import { TextResponse } from './TextResponse'

describe('TextResponse', () => {
  const defaultBlock: TreeBlock<TextResponseBlock> = {
    __typename: 'TextResponseBlock',
    id: 'textResponseBlock.id',
    parentBlockId: null,
    parentOrder: null,
    children: []
  }

  it('should show default attributes', () => {
    const { getByRole } = render(<TextResponse {...defaultBlock} />)

    expect(
      getByRole('button', { name: 'Text Field text-field-label' })
    ).toBeInTheDocument()
  })
})
