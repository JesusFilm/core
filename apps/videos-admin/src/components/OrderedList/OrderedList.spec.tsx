import { render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'

import { OrderedItem } from './OrderedItem'
import { OrderedList } from './OrderedList'

describe('OrderedList', () => {
  it('should provide dnd context', () => {
    const onOrderUpdateMock = jest.fn()
    render(
      <NextIntlClientProvider locale="en">
        <OrderedList onOrderUpdate={onOrderUpdateMock} items={[]}>
          <OrderedItem id="1" label="test" idx={0} />
        </OrderedList>
      </NextIntlClientProvider>
    )

    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})
