import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ActionButton } from './ActionButton'

describe('ActionButton', () => {
  it('should render without actions', async () => {
    render(<ActionButton actions={{}} />)

    const user = userEvent.setup()

    const button = screen.getByRole('button', { name: 'more options' })
    expect(button).toBeInTheDocument()

    await user.click(button)

    expect(screen.queryByText('View')).not.toBeInTheDocument()
    expect(screen.queryByText('Edit')).not.toBeInTheDocument()
    expect(screen.queryByText('Delete')).not.toBeInTheDocument()
  })

  it('should render with actions', async () => {
    const viewFn = jest.fn()
    const editFn = jest.fn()
    const deleteFn = jest.fn()

    render(
      <ActionButton
        actions={{
          view: viewFn,
          edit: editFn,
          delete: deleteFn
        }}
      />
    )

    const user = userEvent.setup()

    const button = screen.getByRole('button', { name: 'more options' })
    expect(button).toBeInTheDocument()

    await user.click(button)

    expect(screen.getByText('View')).toBeInTheDocument()
    expect(screen.getByText('Edit')).toBeInTheDocument()
    expect(screen.getByText('Delete')).toBeInTheDocument()

    await user.click(screen.getByText('View'))
    expect(viewFn).toHaveBeenCalled()

    await user.click(screen.getByText('Edit'))
    expect(editFn).toHaveBeenCalled()

    await user.click(screen.getByText('Delete'))
    expect(deleteFn).toHaveBeenCalled()
  })
})
