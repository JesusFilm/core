import { RadioOption } from './RadioOption'
import {
  fireEvent,
  renderWithApolloClient
} from '../../../../test/testingLibrary'
import { GetJourney_journey_blocks_RadioOptionBlock as RadioOptionBlock } from '../../../../__generated__/GetJourney'
import { TreeBlock } from '../../../libs/transformer/transformer'
import {
  activeBlockVar,
  treeBlocksVar
} from '../../../libs/client/cache/blocks'

describe('RadioOption', () => {
  const block: TreeBlock<RadioOptionBlock> = {
    __typename: 'RadioOptionBlock',
    id: 'RadioOption1',
    label: 'This is a test question 2!',
    parentBlockId: null,
    action: {
      __typename: 'NavigateAction',
      gtmEventName: 'gtmEventName',
      blockId: 'def'
    },
    children: []
  }

  it('should handle onClick', () => {
    const handleClick = jest.fn()
    const { getByRole } = renderWithApolloClient(
      <RadioOption {...block} onClick={handleClick} />
    )
    fireEvent.click(getByRole('button'))
    expect(handleClick).toBeCalledWith(block.id)
  })

  it('should set activeBlockId to action blockId', () => {
    const blockAbc: TreeBlock = {
      id: 'abc',
      __typename: 'StepBlock',
      parentBlockId: null,
      children: []
    }
    const blockDef: TreeBlock = {
      id: 'def',
      __typename: 'StepBlock',
      parentBlockId: null,
      children: []
    }
    treeBlocksVar([blockAbc, blockDef])
    activeBlockVar(blockAbc)
    const { getByRole } = renderWithApolloClient(<RadioOption {...block} />)
    fireEvent.click(getByRole('button'))
    expect(activeBlockVar()).toEqual(blockDef)
  })
})
