import { RadioOption } from './RadioOption'
import { fireEvent, renderWithStore } from '../../../../test/testingLibrary'
import { RadioOptionType } from '../../../types'

const block: RadioOptionType = {
  __typename: 'RadioOption',
  id: 'RadioOption1',
  label: 'This is a test question 2!'
}

describe('RadioOption', () => {
  it('should render option props', () => {
    const { getByText } = renderWithStore(
      <RadioOption {...block} key="question1" selectedId="" />
    )
    expect(getByText(block.label)).toBeInTheDocument()
  })

  it('should handle click', () => {
    const { getByTestId, getByRole } = renderWithStore(
      <RadioOption {...block} key="question1" selectedId="" />
    )
    expect(
      getByTestId('RadioOptionRadioButtonUncheckedIcon')
    ).toBeInTheDocument()
    fireEvent.click(getByRole('button'))
    expect(getByTestId('RadioOptionCheckCircleIcon')).toBeInTheDocument()
  })
})
