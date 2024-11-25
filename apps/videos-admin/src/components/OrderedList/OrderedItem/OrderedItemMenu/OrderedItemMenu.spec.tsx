import { fireEvent, render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'

import { EditProvider } from '../../../../app/[locale]/(dashboard)/videos/[videoId]/_EditProvider'

import { OrderedItemMenu } from './OrderedItemMenu'

describe('OrderedItemMenu', () => {
  it('should call onClick events', () => {
    const editOnClick = jest.fn()
    render(
      <NextIntlClientProvider locale="en">
        <EditProvider initialState={{ isEdit: true }}>
          <OrderedItemMenu
            id="someId"
            actions={[{ label: 'Edit', handler: editOnClick }]}
          />
        </EditProvider>
      </NextIntlClientProvider>
    )

    fireEvent.click(screen.getByRole('button'))
    fireEvent.click(screen.getByRole('menuitem'))
    expect(editOnClick).toHaveBeenCalled()
  })
})
