import { RadioOption } from './RadioOption'
import {
  fireEvent,
  renderWithApolloClient
} from '../../../../test/testingLibrary'
import { GetJourney_journey_blocks_RadioOptionBlock as RadioOptionBlock } from '../../../../__generated__/GetJourney'
import { TreeBlock } from '../../../libs/transformer/transformer'
import { handleAction } from '../../../libs/action'

jest.mock('../../../libs/action', () => {
  const originalModule = jest.requireActual('../../../libs/action')
  return {
    __esModule: true,
    ...originalModule,
    handleAction: jest.fn()
  }
})

jest.mock('next/router', () => ({
  useRouter() {
    return {
      push: () => null
    }
  }
}))

describe('RadioOption', () => {
  const block: TreeBlock<RadioOptionBlock> = {
    __typename: 'RadioOptionBlock',
    id: 'RadioOption1',
    label: 'This is a test question 2!',
    parentBlockId: null,
    action: {
      __typename: 'NavigateToBlockAction',
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

  it('should call actionHandler on click', () => {
    const { getByRole } = renderWithApolloClient(<RadioOption {...block} />)
    fireEvent.click(getByRole('button'))
    expect(handleAction).toBeCalledWith(
      expect.objectContaining({
        push: expect.any(Function)
      }),
      {
        __typename: 'NavigateToBlockAction',
        gtmEventName: 'gtmEventName',
        blockId: 'def'
      }
    )
  })
})
