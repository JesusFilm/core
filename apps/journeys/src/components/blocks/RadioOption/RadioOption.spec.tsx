import { RadioOption } from './RadioOption'
import { fireEvent, renderWithStore } from '../../../../test/testingLibrary'
import { RadioOptionType } from '../../../types'

const block: RadioOptionType = {
  __typename: 'RadioOption',
  id: 'RadioOption1',
  label: 'This is a test question 2!'
}

const handleClick = jest.fn()

describe('RadioOption', () => {
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
