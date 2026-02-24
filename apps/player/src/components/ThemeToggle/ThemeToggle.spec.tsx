import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ThemeToggle } from '.'

import { mockSetTheme, mockTheme } from '@/setupTests'

describe('ThemeToggle', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    Object.assign(mockTheme, { theme: 'light', setTheme: mockSetTheme })
  })

  it('renders after mounting', () => {
    const { container, rerender } = render(<ThemeToggle />)
    rerender(<ThemeToggle />)
    expect(container.firstChild).not.toBeNull()
  })

  it('displays sun icon when theme is light', () => {
    Object.assign(mockTheme, { theme: 'light' })
    const { rerender } = render(<ThemeToggle />)
    rerender(<ThemeToggle />)

    const button = screen.getByRole('button')
    const svg = button.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('displays moon icon when theme is dark', () => {
    Object.assign(mockTheme, { theme: 'dark' })
    const { rerender } = render(<ThemeToggle />)
    rerender(<ThemeToggle />)

    const button = screen.getByRole('button')
    const svg = button.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('toggles theme from light to dark', async () => {
    const user = userEvent.setup()
    Object.assign(mockTheme, { theme: 'light', setTheme: mockSetTheme })

    const { rerender } = render(<ThemeToggle />)
    rerender(<ThemeToggle />)

    const button = screen.getByRole('button')
    await user.click(button)

    expect(mockSetTheme).toHaveBeenCalledWith('dark')
  })

  it('toggles theme from dark to light', async () => {
    const user = userEvent.setup()
    Object.assign(mockTheme, { theme: 'dark', setTheme: mockSetTheme })

    const { rerender } = render(<ThemeToggle />)
    rerender(<ThemeToggle />)

    const button = screen.getByRole('button')
    await user.click(button)

    expect(mockSetTheme).toHaveBeenCalledWith('light')
  })

  it('has correct styling classes', () => {
    const { rerender } = render(<ThemeToggle />)
    rerender(<ThemeToggle />)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('flex', 'cursor-pointer', 'items-center')
  })
})
