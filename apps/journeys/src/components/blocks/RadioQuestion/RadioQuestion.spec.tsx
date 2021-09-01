import { renderWithStore } from '../../../../test/testingLibrary'
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
    const { getByText, getByTestId } = renderWithStore(<RadioQuestion {...(block)} />)
    expect(getByText('Label')).toBeInTheDocument()
    expect(getByText('Description')).toBeInTheDocument()
    expect(getByTestId('RadioQuestionCard')).toHaveClass('MuiRadioQuestionComponent-light')
  })

  it('should render options', () => {
    const { getByText } = renderWithStore(<RadioQuestion {...(block)} />)
    expect(getByText('Option 1')).toBeInTheDocument()
    expect(getByText('Option 2')).toBeInTheDocument()
  })

  it('should render dark them', () => {
    const { getByTestId } = renderWithStore(<RadioQuestion {...(block)} variant="dark" />)
    expect(getByTestId('RadioQuestionCard')).toHaveClass('MuiRadioQuestionComponent-dark')
  })
})
