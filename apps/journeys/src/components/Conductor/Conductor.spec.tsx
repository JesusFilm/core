import { Conductor } from '.'
import { fireEvent, renderWithStore } from '../../../test/testingLibrary'

describe('Conductor', () => {
  it('should show first block', () => {
    const { getByText } = renderWithStore(
      <Conductor blocks={[
        {
          __typename: 'RadioQuestion',
          id: 'Question1',
          label: 'Question 1',
          children: [
            {
              __typename: 'RadioOption',
              id: 'Option1',
              label: 'Option 1',
              action: 'Question2'
            }
          ]
        },
        { __typename: 'RadioQuestion', id: 'Question2', label: 'Question 2' }
      ]} />
    )
    fireEvent.click(getByText('Option 1'))
    expect(getByText('Question 2')).toBeInTheDocument()
  })
})
