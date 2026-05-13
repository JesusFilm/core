import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import '../../../../test/i18n'

import { CollectionUngroupDialog } from './CollectionUngroupDialog'

describe('CollectionUngroupDialog', () => {
  it('does not render when open is false', () => {
    render(
      <CollectionUngroupDialog
        open={false}
        wasPublished={false}
        onClose={jest.fn()}
        onConfirm={jest.fn()}
      />
    )
    expect(
      screen.queryByText('Remove this collection?')
    ).not.toBeInTheDocument()
  })

  it('renders title and base copy when open', () => {
    render(
      <CollectionUngroupDialog
        open
        wasPublished={false}
        onClose={jest.fn()}
        onConfirm={jest.fn()}
      />
    )
    expect(screen.getByText('Remove this collection?')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Removing this collection returns its templates to the flat list.'
      )
    ).toBeInTheDocument()
    // Without wasPublished, the 404 warning is hidden.
    expect(
      screen.queryByText(/Any public URL for this collection will return 404/)
    ).not.toBeInTheDocument()
  })

  it('shows the 404 warning copy when wasPublished is true', () => {
    render(
      <CollectionUngroupDialog
        open
        wasPublished
        onClose={jest.fn()}
        onConfirm={jest.fn()}
      />
    )
    expect(
      screen.getByText('Any public URL for this collection will return 404.')
    ).toBeInTheDocument()
  })

  it('fires onConfirm on Remove and onClose on Cancel', async () => {
    const onConfirm = jest.fn()
    const onClose = jest.fn()
    render(
      <CollectionUngroupDialog
        open
        wasPublished
        onClose={onClose}
        onConfirm={onConfirm}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: 'Remove' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
