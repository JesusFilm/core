import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { ThemeProvider } from '../../ThemeProvider'

import { CollectionDialog } from './CollectionDialog'

import '../../../../test/i18n'

/**
 * Focused coverage for the NES-1660 URL-help info-icon affordance.
 * Full create / edit / submit flows live elsewhere; this spec only
 * exercises the new help-Popover behaviour.
 */
describe('CollectionDialog — URL help info icon (NES-1660)', () => {
  function renderCreateDialog() {
    const utils = render(
      <SnackbarProvider>
        <MockedProvider>
          <ThemeProvider>
            <CollectionDialog
              open
              mode="create"
              teamId="team-1"
              availableJourneys={[]}
              onClose={jest.fn()}
            />
          </ThemeProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    // The PDF/Video URL field lives inside the collapsed "More details"
    // accordion; expand it so the info-icon affordance is mounted.
    fireEvent.click(screen.getByRole('button', { name: 'Expand more details' }))
    return utils
  }

  it('renders an info icon beside the "Add PDF/Video with instructions" header', () => {
    renderCreateDialog()

    expect(
      screen.getByTestId('CollectionDialogUrlHelpTrigger')
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: 'How do I get the right Canva or Google Slides link?'
      })
    ).toBeInTheDocument()
  })

  it('does not render the help Popover by default', () => {
    renderCreateDialog()

    expect(
      screen.queryByTestId('CollectionDialogUrlHelpPopover')
    ).not.toBeInTheDocument()
  })

  it('opens the help Popover with Section 5 content when the info icon is clicked', () => {
    renderCreateDialog()

    fireEvent.click(screen.getByTestId('CollectionDialogUrlHelpTrigger'))

    const popover = screen.getByTestId('CollectionDialogUrlHelpPopover')
    expect(popover).toBeInTheDocument()
    // EmbeddingCanvaOrGoogleSlidesSection content renders inside.
    expect(
      screen.getByTestId('EmbeddingCanvaOrGoogleSlidesSection')
    ).toBeInTheDocument()
    expect(screen.getByTestId('CanvaUrlShapesCheatSheet')).toBeInTheDocument()
  })

  it('toggles aria-expanded on the trigger when the Popover opens', () => {
    renderCreateDialog()

    const trigger = screen.getByTestId('CollectionDialogUrlHelpTrigger')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })
})
