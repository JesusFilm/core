import { fireEvent, renderWithStore } from '../../../../test/testingLibrary'
import { RadioQuestionType } from '../../../types'
import { RadioQuestion } from '.'

const block: RadioQuestionType = {
  __typename: 'RadioQuestion',
  id: 'RadioQuestion1',
  label: 'Label',
  description: 'Description',
  variant: 'light',
  children: [{
    __typename: 'RadioOption',
    id: 'RadioOption1',
    label: 'Option 1'
  }, {
    __typename: 'RadioOption',
    id: 'RadioOption2',
    label: 'Option 2'
  }]
}

describe('RadioQuestion', () => {
  it('should render question props', () => {
    const { getByText, getByTestId } = renderWithStore(<RadioQuestion {...block} />)
    expect(getByText('Label')).toBeInTheDocument()
    expect(getByText('Description')).toBeInTheDocument()
    expect(getByTestId('RadioQuestionCard')).toHaveClass('MuiRadioQuestionComponent-light')
  })

  it('should display the correct options', () => {
    const { getByText } = renderWithStore(<RadioQuestion {...block} />)
    expect(getByText('Option 1')).toBeInTheDocument()
    expect(getByText('Option 2')).toBeInTheDocument()
  })

  it('should select an option OnClick', () => {
    const { getByTestId, getAllByRole } = renderWithStore(<RadioQuestion {...block}/>)
    const buttons = getAllByRole('button')
    fireEvent.click(buttons[0])
    expect(buttons[0]).not.toBeDisabled()
    expect(buttons[0]).toContainElement(getByTestId('RadioOptionCheckCircleIcon'))
  })

  it('should disable unselected options', () => {
    const { getByTestId, getAllByRole } = renderWithStore(
      <RadioQuestion {...block} />
    )
    const buttons = getAllByRole('button')
    fireEvent.click(buttons[0])
    expect(getByTestId('RadioOptionRadioButtonUncheckedIcon')).toBeInTheDocument()
    expect(buttons[1]).toBeDisabled()
    expect(buttons[1]).toContainElement(getByTestId('RadioOptionRadioButtonUncheckedIcon'))
    fireEvent.click(buttons[1])
    expect(buttons[1]).toBeDisabled()
  })
})
