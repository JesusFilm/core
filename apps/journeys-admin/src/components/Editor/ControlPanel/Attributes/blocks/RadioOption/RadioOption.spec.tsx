import { render } from '@testing-library/react'
import { TreeBlock } from '@core/journeys/ui'
import { GetJourneyForEdit_journey_blocks_RadioOptionBlock as RadioOptionBlock } from '../../../../../../../__generated__/GetJourneyForEdit'
import { RadioOption } from '.'

describe('RadioOption Attribute', () => {
  it('shows default attributes', () => {
    const block: TreeBlock<RadioOptionBlock> = {
      id: 'radio-option.id',
      __typename: 'RadioOptionBlock',
      parentBlockId: 'step1.id',
      label: 'Radio Option',
      action: null
    }
    const { getByText } = render(<RadioOption {...block} />)
    expect(getByText('Radio Option')).toBeInTheDocument()
    expect(getByText('None')).toBeInTheDocument()
  })

  it('shows filled attributes', () => {
    const block: TreeBlock<RadioOptionBlock> = {
      id: 'radio-option.id',
      __typename: 'RadioOptionBlock',
      parentBlockId: 'step1.id',
      label: 'Radio Option',
      action: {
        __typename: 'NavigateToBlockAction',
        gtmEventName: 'navigateToBlock',
        blockId: 'step2.id'
      }
    }

    const { getByText } = render(<RadioOption {...block} />)
    expect(getByText('NavigateToBlockAction')).toBeInTheDocument()
  })
})
