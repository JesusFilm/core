import { RadioOption } from './RadioOption'
import { renderWithStore } from '../../../../test/testingLibrary'
import { RadioOptionType } from '../../../types'

const block: RadioOptionType = {
  __typename: 'RadioOption',
  id: 'RadioOption1',
  label: 'This is a test question 2!'
}

describe('RadioOption', () => {
  it('should render option props', () => {
    const { getByText } = renderWithStore(
      <RadioOption
        {...block}
        key="question1"
        selected={false}
        disabled={false}
      />
    )
    expect(getByText(block.label)).toBeInTheDocument()
  })
  it('should render an unselected option', () => {
    const { getByTestId } = renderWithStore(
      <RadioOption
        {...block}
        key="question1"
        selected={false}
        disabled={false}
      />
    )
    expect(
      getByTestId('RadioOptionRadioButtonUncheckedIcon')
    ).toBeInTheDocument()
  })
  it('should render selected option', () => {
    const { getByTestId } = renderWithStore(
      <RadioOption
        {...block}
        key="question1"
        selected={true}
        disabled={false}
      />
    )
    expect(getByTestId('RadioOptionCheckCircleIcon')).toBeInTheDocument()
  })
})
