import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import '../../../../../test/i18n'

import { DiscardConfirmDialog } from './DiscardConfirmDialog'

describe('DiscardConfirmDialog', () => {
  it('does not render when open is false', () => {
    render(
      <DiscardConfirmDialog
        open={false}
        onCancel={jest.fn()}
        onConfirm={jest.fn()}
      />
    )
    expect(
      screen.queryByText('You have unsaved changes — discard?')
    ).not.toBeInTheDocument()
  })

  it('renders the title and explanatory copy when open', () => {
    render(
      <DiscardConfirmDialog
        open
        onCancel={jest.fn()}
        onConfirm={jest.fn()}
      />
    )
    expect(
      screen.getByText('You have unsaved changes — discard?')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Your edits to this collection will be lost.')
    ).toBeInTheDocument()
  })

  it('fires onConfirm when the Discard button is clicked', async () => {
    const onConfirm = jest.fn()
    const onCancel = jest.fn()
    render(
      <DiscardConfirmDialog
        open
        onCancel={onCancel}
        onConfirm={onConfirm}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: 'Discard' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onCancel).not.toHaveBeenCalled()
  })

  it('fires onCancel when the Cancel button is clicked', async () => {
    const onConfirm = jest.fn()
    const onCancel = jest.fn()
    render(
      <DiscardConfirmDialog
        open
        onCancel={onCancel}
        onConfirm={onConfirm}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onConfirm).not.toHaveBeenCalled()
  })
})
