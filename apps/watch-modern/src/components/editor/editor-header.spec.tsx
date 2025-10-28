import { fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import { EditorHeader } from './editor-header'

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt = '', ...props }: { alt?: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...props} />
  )
}))

const defaultProps = {
  onNavigateHome: jest.fn(),
  onNavigatePlan: jest.fn(),
  onToggleSessions: jest.fn(),
  onOpenSettings: jest.fn(),
  tokenSummary: null,
  isTokensUpdated: false,
  children: null
}

describe('EditorHeader site selector', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('opens and closes the site selector menu', () => {
    render(<EditorHeader {...defaultProps} />)

    const toggleButton = screen.getByRole('button', {
      name: /open site selector/i
    })
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()

    fireEvent.click(toggleButton)

    expect(toggleButton).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('menu')).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /Videos/i })).toHaveAttribute(
      'href',
      'https://www.jesusfilm.org/watch'
    )

    const studioMenuItem = screen.getByRole('menuitem', { name: /Studio/i })
    expect(studioMenuItem).toHaveAttribute('aria-current', 'page')

    fireEvent.click(studioMenuItem)
    expect(defaultProps.onNavigateHome).toHaveBeenCalled()
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()

    fireEvent.click(toggleButton)

    expect(toggleButton).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('menu')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('menuitem', { name: /Videos/i }))

    expect(toggleButton).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('closes the menu when clicking outside', () => {
    render(<EditorHeader {...defaultProps} />)

    const toggleButton = screen.getByRole('button', {
      name: /open site selector/i
    })
    fireEvent.click(toggleButton)
    expect(screen.getByRole('menu')).toBeInTheDocument()

    fireEvent.mouseDown(document.body)

    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false')
  })
})
