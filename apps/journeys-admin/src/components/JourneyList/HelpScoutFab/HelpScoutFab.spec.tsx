import { fireEvent, render, screen } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'

import { HelpScoutFab } from './HelpScoutFab'

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

    it('should render HelpScoutFab', () => {
        render(<HelpScoutFab />)
        expect(screen.getByTestId('HelpScoutFab')).toBeInTheDocument()
    })

    it('should toggle beacon when clicked', () => {
        mockedUseRouter.mockReturnValue({
            events: {
                on: jest.fn(),
                off: jest.fn()
            }
        } as unknown as NextRouter)

        render(<HelpScoutFab />)

        fireEvent.click(screen.getByTestId('HelpScoutFab'))
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
        render(<HelpScoutFab />)

        fireEvent.click(screen.getByTestId('HelpScoutFab'))
        expect(push).toHaveBeenCalledWith('https://support.nextstep.is/')
    })

    it('should change icon when beacon is toggled', () => {
        mockedUseRouter.mockReturnValue({
            events: {
                on: jest.fn(),
                off: jest.fn()
            }
        } as unknown as NextRouter)
        render(<HelpScoutFab />)
        fireEvent.click(screen.getByTestId('HelpScoutFab'))
        expect(screen.getByTestId('HelpScoutFabCloseIcon')).toBeInTheDocument()
        fireEvent.click(screen.getByTestId('HelpScoutFab'))
        expect(screen.getByTestId('HelpScoutFabHelpIcon')).toBeInTheDocument()
    })
})
