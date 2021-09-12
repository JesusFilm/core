import { Conductor } from '.'
import { fireEvent, renderWithApolloClient } from '../../../test/testingLibrary'
import { activeBlockVar, treeBlocksVar } from '../../libs/client/cache/blocks'
import { TreeBlock } from '../../libs/transformer/transformer'

describe('Conductor', () => {
  it('should show first block', () => {
    const blocks: TreeBlock[] = [
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
    ]
    const { getByText } = renderWithApolloClient(
      <Conductor blocks={blocks} />
    )
    expect(treeBlocksVar()).toBe(blocks)
    expect(activeBlockVar()?.id).toBe('Question1')
    fireEvent.click(getByText('Option 1'))
    expect(activeBlockVar()?.id).toBe('Question2')
    expect(getByText('Question 2')).toBeInTheDocument()
  })
})
