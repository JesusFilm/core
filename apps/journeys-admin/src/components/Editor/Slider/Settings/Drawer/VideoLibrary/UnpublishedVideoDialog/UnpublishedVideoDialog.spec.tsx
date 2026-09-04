import { fireEvent, render } from '@testing-library/react'

import { UnpublishedVideoDialog } from './UnpublishedVideoDialog'

describe('UnpublishedVideoDialog', () => {
  it('should render the unpublished warning when open', () => {
    const { getByText } = render(
      <UnpublishedVideoDialog open onClose={vi.fn()} onConfirm={vi.fn()} />
    )

    expect(getByText('Unpublished Video')).toBeInTheDocument()
    expect(
      getByText(
        'This video has not been published yet. It can still be added to a journey, but visitors will not be able to watch it until it is published.'
      )
    ).toBeInTheDocument()
  })

  it('should call onConfirm when the user acknowledges the warning', () => {
    const onConfirm = vi.fn()
    const { getByRole } = render(
      <UnpublishedVideoDialog open onClose={vi.fn()} onConfirm={onConfirm} />
    )

    fireEvent.click(getByRole('button', { name: 'Use Anyway' }))
    expect(onConfirm).toHaveBeenCalled()
  })

  it('should call onClose when the user cancels', () => {
    const onClose = vi.fn()
    const { getByRole } = render(
      <UnpublishedVideoDialog open onClose={onClose} onConfirm={vi.fn()} />
    )

    fireEvent.click(getByRole('button', { name: 'Cancel' }))
    expect(onClose).toHaveBeenCalled()
  })

  it('should not render its content when closed', () => {
    const { queryByText } = render(
      <UnpublishedVideoDialog
        open={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    )

    expect(queryByText('Unpublished Video')).not.toBeInTheDocument()
  })
})
