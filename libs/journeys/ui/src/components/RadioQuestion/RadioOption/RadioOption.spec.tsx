import { fireEvent, render } from '@testing-library/react'
import { TreeBlock, handleAction } from '../../..'
import { RadioOption } from './RadioOption'
import { RadioOptionFields } from './__generated__/RadioOptionFields'

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

const block: TreeBlock<RadioOptionFields> = {
  __typename: 'RadioOptionBlock',
  id: 'radioOption1.id',
  label: 'Option 1',
  parentBlockId: 'RadioQuestion1',
  parentOrder: 0,
  action: {
    __typename: 'NavigateToBlockAction',
    parentBlockId: 'radioOption1.id',
    gtmEventName: 'gtmEventName',
    blockId: 'def'
  },
  children: []
}

describe('RadioOption', () => {
  it('should handle onClick', () => {
    const handleClick = jest.fn()
    const { getByRole } = render(
      <RadioOption {...block} onClick={handleClick} />
    )
    fireEvent.click(getByRole('button'))
    expect(handleClick).toBeCalledWith(block.id)
  })

  it('should call actionHandler on click', () => {
    const { getByRole } = render(<RadioOption {...block} />)
    fireEvent.click(getByRole('button'))
    expect(handleAction).toBeCalledWith(
      expect.objectContaining({
        push: expect.any(Function)
      }),
      false,
      {
        __typename: 'NavigateToBlockAction',
        parentBlockId: 'radioOption1.id',
        gtmEventName: 'gtmEventName',
        blockId: 'def'
      }
    )
  })
})
