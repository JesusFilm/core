import { fireEvent, render, screen } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'

import { HelpScoutBeacon } from './HelpScoutBeacon'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('HelpScoutBeacon', () => {
  beforeEach(() => {
    window.Beacon = jest.fn()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should render icon button', () => {
    const handleClick = jest.fn()
    mockedUseRouter.mockReturnValue({
      events: {
        on: jest.fn(),
        off: jest.fn()
      }
    } as unknown as NextRouter)

    render(<HelpScoutBeacon handleClick={handleClick} />)

    fireEvent.click(screen.getByRole('button', { name: 'Help' }))
    expect(handleClick).toHaveBeenCalled()
  })

  it('should render menu item', () => {
    const handleClick = jest.fn()
    mockedUseRouter.mockReturnValue({
      events: {
        on: jest.fn(),
        off: jest.fn()
      }
    } as unknown as NextRouter)

    render(<HelpScoutBeacon variant="menuItem" handleClick={handleClick} />)

    fireEvent.click(screen.getByRole('menuitem', { name: 'Help' }))
    expect(handleClick).toHaveBeenCalled()
  })

  it('should update icon if beacon has been manually opened', () => {
    mockedUseRouter.mockReturnValue({
      events: {
        on: jest.fn(),
        off: jest.fn()
      }
    } as unknown as NextRouter)

    render(<HelpScoutBeacon />)

    expect(window.Beacon).toHaveBeenCalledWith(
      'on',
      'open',
      expect.any(Function)
    )
  })

  it('should open beacon', () => {
    mockedUseRouter.mockReturnValue({
      events: {
        on: jest.fn(),
        off: jest.fn()
      }
    } as unknown as NextRouter)

    render(<HelpScoutBeacon />)

    expect(screen.getByTestId('HelpCircleContainedIcon')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Help' }))
    expect(window.Beacon).toHaveBeenCalledWith('toggle')
  })

  it('should open help page if beacon has not loaded', () => {
    const push = jest.fn()
    mockedUseRouter.mockReturnValue({
      events: {
        on: jest.fn(),
        off: jest.fn()
      },
      push
    } as unknown as NextRouter)
    window.Beacon = undefined

    render(<HelpScoutBeacon />)

    fireEvent.click(screen.getByRole('button', { name: 'Help' }))
    expect(push).toHaveBeenCalledWith('https://support.nextstep.is/')
  })
})
