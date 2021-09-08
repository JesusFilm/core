import { RadioOption } from './RadioOption'
import { fireEvent, renderWithStore } from '../../../../test/testingLibrary'
import { GetJourney_journey_blocks_RadioOptionBlock as RadioOptionBlock } from '../../../../__generated__/GetJourney'
import { TreeBlock } from '../../../libs/transformer/transformer'

describe('RadioOption', () => {
  const block: TreeBlock<RadioOptionBlock> = {
    __typename: 'RadioOptionBlock',
    id: 'RadioOption1',
    label: 'This is a test question 2!',
    parentBlockId: null,
    action: {
      __typename: 'LinkAction',
      gtmEventName: 'gtmEventName',
      url: 'https://jesusfilm.org'
    },
    children: []
  }
  const handleClick = jest.fn()
  it('should handle onClick', () => {
    const { getByRole } = renderWithStore(
      <RadioOption
        {...block}
        key="question"
        selected={false}
        disabled={false}
        handleClick={handleClick}
      />
    )
    fireEvent.click(getByRole('button'))
    expect(handleClick).toBeCalledWith(block.id, block.action)
  })
})
