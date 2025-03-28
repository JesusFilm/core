import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NextIntlClientProvider } from 'next-intl'

import { ConfirmDeleteDialog } from './ConfirmDeleteDialog'

describe('ConfirmDeleteDialog', () => {
  const handleClose = jest.fn()
  const handleConfirm = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render the dialog', () => {
    render(
      <NextIntlClientProvider locale="en">
        <ConfirmDeleteDialog
          open
          handleClose={handleClose}
          handleConfirm={handleConfirm}
        />
      </NextIntlClientProvider>
    )

    expect(
      screen.getByText('Are you sure you want to delete this download?')
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument()
  })

  it('should call handleClose when cancel is clicked', async () => {
    render(
      <NextIntlClientProvider locale="en">
        <ConfirmDeleteDialog
          open
          handleClose={handleClose}
          handleConfirm={handleConfirm}
        />
      </NextIntlClientProvider>
    )

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(handleClose).toHaveBeenCalled()
    expect(handleConfirm).not.toHaveBeenCalled()
  })

  it('should call handleConfirm when confirm is clicked', async () => {
    render(
      <NextIntlClientProvider locale="en">
        <ConfirmDeleteDialog
          open
          handleClose={handleClose}
          handleConfirm={handleConfirm}
        />
      </NextIntlClientProvider>
    )

    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }))
    expect(handleConfirm).toHaveBeenCalled()
    expect(handleClose).not.toHaveBeenCalled()
  })

  it('should not render when open is false', () => {
    render(
      <NextIntlClientProvider locale="en">
        <ConfirmDeleteDialog
          open={false}
          handleClose={handleClose}
          handleConfirm={handleConfirm}
        />
      </NextIntlClientProvider>
    )

    expect(
      screen.queryByText('Are you sure you want to delete this download?')
    ).not.toBeInTheDocument()
  })
})
