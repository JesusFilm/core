import { fireEvent, render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'

import Edit2 from '@core/shared/ui/icons/Edit2'
import EyeOpen from '@core/shared/ui/icons/EyeOpen'

import { OrderedItemIcons } from './OrderedItemIcons'

describe('OrderedItemIcons', () => {
  it('should call onClick events', () => {
    const viewOnClick = jest.fn()
    const editOnClick = jest.fn()
    render(
      <NextIntlClientProvider locale="en">
        <OrderedItemIcons
          iconButtons={[
            {
              Icon: EyeOpen,
              events: {
                onClick: viewOnClick
              },
              name: 'View'
            },
            {
              Icon: Edit2,
              events: {
                onClick: editOnClick
              },
              name: 'Edit'
            }
          ]}
        />
      </NextIntlClientProvider>
    )

    fireEvent.click(screen.getByTestId('EyeOpenIcon'))
    expect(viewOnClick).toHaveBeenCalled()

    fireEvent.click(screen.getByTestId('Edit2Icon'))
    expect(editOnClick).toHaveBeenCalled()
  })
})
