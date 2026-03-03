import { fireEvent, render, screen } from '@testing-library/react'

import { QuickStartBadge } from '.'

import '../../../test/i18n'

describe('QuickStartBadge', () => {
  it('renders the lightning icon and Quick Start text', () => {
    render(<QuickStartBadge />)

    expect(screen.getByText('Quick Start')).toBeInTheDocument()
  })

  it('expands label on mouse enter and collapses on mouse leave when uncontrolled', () => {
    render(<QuickStartBadge />)

    const label = screen.getByText('Quick Start')

    expect(label).toHaveStyle({ opacity: '0' })

    fireEvent.mouseEnter(label.parentElement as HTMLElement)
    expect(label).toHaveStyle({ opacity: '1' })

    fireEvent.mouseLeave(label.parentElement as HTMLElement)
    expect(label).toHaveStyle({ opacity: '0' })
  })

  it('expands when hovered prop is true', () => {
    render(<QuickStartBadge hovered />)

    const label = screen.getByText('Quick Start')
    expect(label).toHaveStyle({ opacity: '1' })
  })

  it('collapses when hovered prop is false', () => {
    render(<QuickStartBadge hovered={false} />)

    const label = screen.getByText('Quick Start')
    expect(label).toHaveStyle({ opacity: '0' })
  })

  it('does not respond to mouse events when hovered prop is provided', () => {
    render(<QuickStartBadge hovered={false} />)

    const label = screen.getByText('Quick Start')
    expect(label).toHaveStyle({ opacity: '0' })

    // mouseEnter should have no effect since hovered is controlled externally
    fireEvent.mouseEnter(label.parentElement as HTMLElement)
    expect(label).toHaveStyle({ opacity: '0' })
  })
})
