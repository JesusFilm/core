import { fireEvent, render, screen } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { type MockedFunction } from 'vitest'

import { HelpScoutBeacon } from './HelpScoutBeacon'

vi.mock('next/router', () => ({
  __esModule: true,
  useRouter: vi.fn()
}))

const mockedUseRouter = useRouter as MockedFunction<typeof useRouter>

describe('HelpScoutBeacon', () => {
  beforeEach(() => {
    window.Beacon = vi.fn()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should render icon button', () => {
    const handleClick = vi.fn()
    mockedUseRouter.mockReturnValue({
      events: {
        on: vi.fn(),
        off: vi.fn()
      }
    } as unknown as NextRouter)

    render(<HelpScoutBeacon handleClick={handleClick} />)

    fireEvent.click(screen.getByRole('button', { name: 'Help' }))
    expect(handleClick).toHaveBeenCalled()
  })

  it('should render menu item', () => {
    const handleClick = vi.fn()
    mockedUseRouter.mockReturnValue({
      events: {
        on: vi.fn(),
        off: vi.fn()
      }
    } as unknown as NextRouter)

    render(<HelpScoutBeacon variant="menuItem" handleClick={handleClick} />)

    fireEvent.click(screen.getByRole('menuitem', { name: 'Help' }))
    expect(handleClick).toHaveBeenCalled()
  })

  it('should update icon if beacon has been manually opened', () => {
    mockedUseRouter.mockReturnValue({
      events: {
        on: vi.fn(),
        off: vi.fn()
      }
    } as unknown as NextRouter)

    render(<HelpScoutBeacon />)

    expect(window.Beacon).toHaveBeenCalledWith(
      'on',
      'open',
      expect.any(Function)
    )
    expect(screen.getByTestId('HelpCircleContainedIcon')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Help' }))
    expect(window.Beacon).toHaveBeenCalledWith('toggle')
  })

  it('should open beacon', () => {
    mockedUseRouter.mockReturnValue({
      events: {
        on: vi.fn(),
        off: vi.fn()
      }
    } as unknown as NextRouter)

    render(<HelpScoutBeacon />)

    expect(screen.getByTestId('HelpCircleContainedIcon')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Help' }))
    expect(window.Beacon).toHaveBeenCalledWith('toggle')
  })

  it('should open help page if beacon has not loaded', () => {
    const push = vi.fn()
    mockedUseRouter.mockReturnValue({
      events: {
        on: vi.fn(),
        off: vi.fn()
      },
      push
    } as unknown as NextRouter)
    window.Beacon = undefined

    render(<HelpScoutBeacon />)

    fireEvent.click(screen.getByRole('button', { name: 'Help' }))
    expect(push).toHaveBeenCalledWith('https://support.nextstep.is/')
  })
})
