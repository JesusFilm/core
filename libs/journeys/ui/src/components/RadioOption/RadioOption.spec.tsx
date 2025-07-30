import { fireEvent, render } from '@testing-library/react'

import { handleAction } from '../../libs/action'
import type { TreeBlock } from '../../libs/block'

import { RadioOptionFields } from './__generated__/RadioOptionFields'

import { RadioOption } from '.'

jest.mock('../../libs/action', () => {
  const originalModule = jest.requireActual('../../libs/action')
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
  pollOptionImageId: null,
  children: []
}

describe('RadioOption', () => {
  it('should handle onClick', () => {
    const handleClick = jest.fn()
    const { getByRole } = render(
      <RadioOption {...block} onClick={handleClick} />
    )
    fireEvent.click(getByRole('button'))
    expect(handleClick).toHaveBeenCalledWith(block.id, block.label)
  })

  it('should call actionHandler on click', () => {
    const { getByRole } = render(<RadioOption {...block} />)
    fireEvent.click(getByRole('button'))
    expect(handleAction).toHaveBeenCalledWith(
      expect.objectContaining({
        push: expect.any(Function)
      }),
      {
        __typename: 'NavigateToBlockAction',
        parentBlockId: 'radioOption1.id',
        gtmEventName: 'gtmEventName',
        blockId: 'def'
      },
      undefined
    )
  })
})
