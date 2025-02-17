import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NextIntlClientProvider } from 'next-intl'

import { CancelButton } from './CancelButton'

const mockCancel = jest.fn()

describe('CancelButton', () => {
  it('should render cancel button', () => {
    render(
      <NextIntlClientProvider locale="en">
        <CancelButton show handleCancel={mockCancel} />
      </NextIntlClientProvider>
    )

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('should not render save button if show is false', () => {
    render(
      <NextIntlClientProvider locale="en">
        <CancelButton show={false} handleCancel={mockCancel} />
      </NextIntlClientProvider>
    )

    expect(
      screen.queryByRole('button', { name: 'Cancel' })
    ).not.toBeInTheDocument()
  })

  it('should call handleCancel callback when clicked', async () => {
    render(
      <NextIntlClientProvider locale="en">
        <CancelButton show handleCancel={mockCancel} />
      </NextIntlClientProvider>
    )

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(mockCancel).toHaveBeenCalled()
  })
})
