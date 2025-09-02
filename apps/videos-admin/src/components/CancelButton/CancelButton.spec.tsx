import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { CancelButton } from './CancelButton'

const mockCancel = jest.fn()

describe('CancelButton', () => {
  it('should render cancel button', () => {
    render(<CancelButton show handleCancel={mockCancel} />)

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('should not render save button if show is false', () => {
    render(<CancelButton show={false} handleCancel={mockCancel} />)

    expect(
      screen.queryByRole('button', { name: 'Cancel' })
    ).not.toBeInTheDocument()
  })

  it('should call handleCancel callback when clicked', async () => {
    render(<CancelButton show handleCancel={mockCancel} />)

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(mockCancel).toHaveBeenCalled()
  })
})
