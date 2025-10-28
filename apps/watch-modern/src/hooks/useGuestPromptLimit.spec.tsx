import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import React, { useState } from 'react'

import { GUEST_PROMPT_LIMIT, useGuestPromptLimit } from './useGuestPromptLimit'

function GuestPromptHarness({ initialAuth = false }: { initialAuth?: boolean }) {
  const [isAuthenticated, setIsAuthenticated] = useState(initialAuth)
  const { remaining, isAtLimit, registerPrompt } = useGuestPromptLimit(isAuthenticated)

  return (
    <div>
      <div data-testid="remaining">
        {Number.isFinite(remaining) ? remaining : 'infinite'}
      </div>
      <div data-testid="isAtLimit">{isAtLimit ? 'true' : 'false'}</div>
      <button type="button" onClick={() => registerPrompt()}>
        register
      </button>
      <button type="button" onClick={() => setIsAuthenticated((prev) => !prev)}>
        toggle
      </button>
    </div>
  )
}

describe('useGuestPromptLimit', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  afterEach(() => {
    cleanup()
  })

  it('tracks guest prompt usage and persists to localStorage', () => {
    const { unmount } = render(<GuestPromptHarness />)

    expect(screen.getByTestId('remaining')).toHaveTextContent(
      String(GUEST_PROMPT_LIMIT)
    )
    expect(screen.getByTestId('isAtLimit')).toHaveTextContent('false')

    for (let index = 0; index < GUEST_PROMPT_LIMIT; index += 1) {
      fireEvent.click(screen.getByText('register'))
    }

    expect(screen.getByTestId('remaining')).toHaveTextContent('0')
    expect(screen.getByTestId('isAtLimit')).toHaveTextContent('true')

    // re-render to verify state is restored from localStorage
    unmount()
    render(<GuestPromptHarness />)

    expect(screen.getByTestId('remaining')).toHaveTextContent('0')
    expect(screen.getByTestId('isAtLimit')).toHaveTextContent('true')
  })

  it('resets usage when the user signs in', () => {
    render(<GuestPromptHarness />)

    fireEvent.click(screen.getByText('register'))

    expect(screen.getByTestId('remaining')).toHaveTextContent(
      String(GUEST_PROMPT_LIMIT - 1)
    )

    fireEvent.click(screen.getByText('toggle'))

    expect(screen.getByTestId('remaining')).toHaveTextContent('infinite')
    expect(screen.getByTestId('isAtLimit')).toHaveTextContent('false')
    expect(window.localStorage.getItem('watchModern.guestPromptUsage')).toBeNull()
  })
})
