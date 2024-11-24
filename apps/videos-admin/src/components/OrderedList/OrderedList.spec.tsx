import { render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import { EditProvider } from '../../app/[locale]/(dashboard)/videos/[videoId]/_EditProvider'
import { OrderedList } from './OrderedList'
import { OrderedItem } from './OrderedItem'

describe('OrderedList', () => {
  it('should provide dnd context', () => {
    const onOrderUpdateMock = jest.fn()
    render(
      <NextIntlClientProvider locale="en">
        <EditProvider initialState={{ isEdit: true }}>
          <OrderedList onOrderUpdate={onOrderUpdateMock} items={[]}>
            <OrderedItem id={'1'} label={'test'} idx={0}></OrderedItem>
          </OrderedList>
        </EditProvider>
      </NextIntlClientProvider>
    )

    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})
