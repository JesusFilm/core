import { fireEvent, render, screen } from '@testing-library/react'

import { CampaignPageKind } from '../../../../__generated__/globalTypes'

import { SectionDeleteDialog } from './SectionDeleteDialog'

describe('SectionDeleteDialog', () => {
  it('points at undo on the landing page, with no region warning', () => {
    const onConfirm = vi.fn()
    const onClose = vi.fn()
    render(
      <SectionDeleteDialog
        open
        pageKind={CampaignPageKind.landing}
        onClose={onClose}
        onConfirm={onConfirm}
      />
    )

    expect(screen.getByRole('dialog')).toHaveTextContent('Delete section?')
    expect(screen.getByText('You can undo this afterwards.')).toBeInTheDocument()
    expect(
      screen.queryByText('This removes the section from every region page.')
    ).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(onConfirm).toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onClose).toHaveBeenCalled()
  })

  it('keeps the "from every region page" warning on the Region Page', () => {
    render(
      <SectionDeleteDialog
        open
        pageKind={CampaignPageKind.regionTemplate}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    )

    expect(
      screen.getByText('This removes the section from every region page.')
    ).toBeInTheDocument()
    expect(screen.getByText('You can undo this afterwards.')).toBeInTheDocument()
  })

  it('renders nothing while closed', () => {
    render(
      <SectionDeleteDialog
        open={false}
        pageKind={CampaignPageKind.landing}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
