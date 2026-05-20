import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { TemplateInfoHelper } from './TemplateInfoHelper'

describe('TemplateInfoHelper', () => {
  it('renders the trigger button collapsed by default', () => {
    render(<TemplateInfoHelper />)

    const trigger = screen.getByTestId('TemplateInfoHelperTrigger')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveAttribute('aria-label', 'Open template info')
    expect(screen.queryByTestId('TemplateInfoPanel')).not.toBeInTheDocument()
  })

  it('opens the panel on trigger click and reflects state in ARIA', () => {
    render(<TemplateInfoHelper />)

    const trigger = screen.getByTestId('TemplateInfoHelperTrigger')
    fireEvent.click(trigger)

    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(trigger).toHaveAttribute('aria-label', 'Close template info')
    expect(screen.getByTestId('TemplateInfoPanel')).toBeInTheDocument()
  })

  it('closes the panel on a second trigger click', () => {
    render(<TemplateInfoHelper />)

    const trigger = screen.getByTestId('TemplateInfoHelperTrigger')
    fireEvent.click(trigger)
    fireEvent.click(trigger)

    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    // Fade with `unmountOnExit` removes the panel after the transition.
    return waitFor(() =>
      expect(screen.queryByTestId('TemplateInfoPanel')).not.toBeInTheDocument()
    )
  })

  it('mounts a contained `TemplateInfoPanel` when open', () => {
    render(<TemplateInfoHelper />)
    fireEvent.click(screen.getByTestId('TemplateInfoHelperTrigger'))

    const panel = screen.getByTestId('TemplateInfoPanel')
    expect(panel).toHaveClass('MuiPaper-root')
    expect(panel).toHaveClass('MuiPaper-rounded')
  })

  it('closes when Escape is pressed and returns focus to the trigger', () => {
    render(<TemplateInfoHelper />)
    const trigger = screen.getByTestId('TemplateInfoHelperTrigger')
    fireEvent.click(trigger)

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveFocus()
  })

  it('closes when clicking outside the helper and returns focus to the trigger', async () => {
    const user = userEvent.setup()
    render(
      <div>
        <button data-testid="outside">outside</button>
        <TemplateInfoHelper />
      </div>
    )

    const trigger = screen.getByTestId('TemplateInfoHelperTrigger')
    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')

    await user.click(screen.getByTestId('outside'))

    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveFocus()
  })

  it('does not close when clicking inside the open panel', async () => {
    const user = userEvent.setup()
    render(<TemplateInfoHelper />)
    const trigger = screen.getByTestId('TemplateInfoHelperTrigger')
    await user.click(trigger)

    await user.click(screen.getByText('What templates are about:'))

    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByTestId('TemplateInfoPanel')).toBeInTheDocument()
  })

  it('renders accordions collapsed every time the panel is re-opened', async () => {
    render(<TemplateInfoHelper />)
    const user = userEvent.setup()
    const trigger = screen.getByTestId('TemplateInfoHelperTrigger')

    await user.click(trigger)
    const howToCreate = screen.getByRole('button', { name: 'How to create' })
    await user.click(howToCreate)
    expect(howToCreate).toHaveAttribute('aria-expanded', 'true')

    // Close
    fireEvent.keyDown(document, { key: 'Escape' })
    await waitFor(() =>
      expect(screen.queryByTestId('TemplateInfoPanel')).not.toBeInTheDocument()
    )

    // Re-open
    await user.click(trigger)
    expect(
      screen.getByRole('button', { name: 'How to create' })
    ).toHaveAttribute('aria-expanded', 'false')
  })
})
