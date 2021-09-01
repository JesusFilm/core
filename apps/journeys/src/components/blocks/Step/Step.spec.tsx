import { renderWithStore } from '../../../../test/testingLibrary'
import { StepType } from '../../../types'
import { Step } from '.'

const block: StepType = {
  __typename: 'Step',
  id: 'Step1',
  children: [{
    __typename: 'RadioQuestion',
    id: 'Question1',
    label: 'Question 1'
  }, {
    __typename: 'RadioQuestion',
    id: 'Question2',
    label: 'Question 2'
  }]
}

describe('RadioQuestion', () => {
  it('should render blocks', () => {
    const { getByText } = renderWithStore(<Step {...block} />)
    expect(getByText('Question 1')).toBeInTheDocument()
    expect(getByText('Question 2')).toBeInTheDocument()
  })
})
