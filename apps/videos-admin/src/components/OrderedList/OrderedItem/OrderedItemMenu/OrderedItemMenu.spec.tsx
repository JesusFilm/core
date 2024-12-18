import { fireEvent, render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'

import { OrderedItemMenu } from './OrderedItemMenu'

describe('OrderedItemMenu', () => {
  it('should call onClick events', () => {
    const editOnClick = jest.fn()
    render(
      <NextIntlClientProvider locale="en">
        <OrderedItemMenu
          id="someId"
          actions={[{ label: 'Edit', handler: editOnClick }]}
        />
      </NextIntlClientProvider>
    )

    fireEvent.click(screen.getByRole('button'))
    fireEvent.click(screen.getByRole('menuitem'))
    expect(editOnClick).toHaveBeenCalled()
  })
})
