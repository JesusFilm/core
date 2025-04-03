import { render, screen } from '@testing-library/react'

import { OrderedItem } from './OrderedItem'
import { OrderedList } from './OrderedList'

describe('OrderedList', () => {
  it('should provide dnd context', () => {
    const onOrderUpdateMock = jest.fn()
    render(
      <OrderedList onOrderUpdate={onOrderUpdateMock} items={[]}>
        <OrderedItem id="1" label="test" idx={0} />
      </OrderedList>
    )

    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})
