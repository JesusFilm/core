import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ConfirmDeleteDialog } from './page'

describe('ConfirmDeleteDialog', () => {
  const handleClose = jest.fn()
  const handleConfirm = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render the dialog', () => {
    render(
      <ConfirmDeleteDialog
        open
        handleClose={handleClose}
        handleConfirm={handleConfirm}
      />
    )

    expect(
      screen.getByText('Are you sure you want to delete this download?')
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument()
  })

  it('should call handleClose when cancel is clicked', async () => {
    render(
      <ConfirmDeleteDialog
        open
        handleClose={handleClose}
        handleConfirm={handleConfirm}
      />
    )

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(handleClose).toHaveBeenCalled()
    expect(handleConfirm).not.toHaveBeenCalled()
  })

  it('should call handleConfirm when confirm is clicked', async () => {
    render(
      <ConfirmDeleteDialog
        open
        handleClose={handleClose}
        handleConfirm={handleConfirm}
      />
    )

    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }))
    expect(handleConfirm).toHaveBeenCalled()
    expect(handleClose).not.toHaveBeenCalled()
  })

  it('should not render when open is false', () => {
    render(
      <ConfirmDeleteDialog
        open={false}
        handleClose={handleClose}
        handleConfirm={handleConfirm}
      />
    )

    expect(
      screen.queryByText('Are you sure you want to delete this download?')
    ).not.toBeInTheDocument()
  })
})
