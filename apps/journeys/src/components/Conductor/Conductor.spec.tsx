import { Conductor } from '.'
import { fireEvent, renderWithStore } from '../../../test/testingLibrary'

describe('Conductor', () => {
  it('should show first block', () => {
    const { getByText } = renderWithStore(
      <Conductor blocks={[
        {
          __typename: 'RadioQuestionBlock',
          id: 'Question1',
          label: 'Question 1',
          children: [
            {
              __typename: 'RadioOptionBlock',
              id: 'Option1',
              label: 'Option 1',
              parentBlockId: 'Question1',
              action: {
                __typename: 'NavigateAction',
                gtmEventName: 'gtmEventName',
                blockId: 'Question2'
              },
              children: []
            }
          ],
          parentBlockId: null,
          description: 'description',
          variant: null
        },
        {
          __typename: 'RadioQuestionBlock',
          id: 'Question2',
          label: 'Question 2',
          children: [],
          parentBlockId: null,
          description: 'description',
          variant: null
        }
      ]} />
    )
    fireEvent.click(getByText('Option 1'))
    expect(getByText('Question 2')).toBeInTheDocument()
  })
})
