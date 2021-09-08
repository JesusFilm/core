import { RadioOption } from './RadioOption'
import { fireEvent, renderWithStore } from '../../../../test/testingLibrary'
import { GetJourney_journey_blocks_RadioOptionBlock as RadioOptionBlock } from '../../../../__generated__/GetJourney'
import { TreeBlock } from '../../../libs/transformer/transformer'

describe('RadioOption', () => {
  const block: TreeBlock<RadioOptionBlock> = {
    __typename: 'RadioOptionBlock',
    id: 'RadioOption1',
    label: 'This is a test question 2!',
    parentBlockId: null,
    image: null,
    children: []
  }
  it('should render option props', () => {
    const { getByText } = renderWithStore(
      <RadioOption {...block} />
    )
    expect(getByText(block.label)).toBeInTheDocument()
  })

  it('should handle click', () => {
    const { getByTestId, getByRole } = renderWithStore(
      <RadioOption {...block} />
    )
    expect(getByTestId('RadioOptionRadioButtonUncheckedIcon')).toBeInTheDocument()
    fireEvent.click(getByRole('button'))
    expect(getByTestId('RadioOptionCheckCircleIcon')).toBeInTheDocument()
  })
})
