import { fireEvent, render, screen } from '@testing-library/react'

import { useBreakpoints } from '@core/shared/ui/useBreakpoints'

import { HeaderTabButtons } from './HeaderTabButtons'

jest.mock('@core/shared/ui/useBreakpoints', () => ({
  __esModule: true,
  useBreakpoints: jest.fn()
}))

describe('HeaderTabButtons', () => {
  // should render headertabbuttons x
  // should render dropdown button on smaller devices x
  // should render mui menu on dropdown button click x
  // tab buttons should have correct href attributes x
  // dropdown buttons should have correct href attributes x
  // on tabbuttons, test that correct button is selected(has red border color)?
  // on dropdownbutton, test that correct menu item is selected?
  // should navigate to other pages on button click (eg journeys button to ./journeys)?
  // ? should hide buttons based on launchdarkly flags?
  // tests for large viewport?
  // tests for smaller viewport?

  describe('tab buttons', () => {
    // beforeEach(() => {
    //   const useBreakpointsMock = useBreakpoints as jest.Mock
    //   useBreakpointsMock.mockReturnValue({
    //     xs: false,
    //     sm: false,
    //     md: false,
    //     lg: true,
    //     xl: true
    //   })
    // })

    it('should render headertabbuttons', () => {
      render(<HeaderTabButtons />)
      expect(screen.getByTestId('HeaderTabButtons')).toBeInTheDocument()
      expect(screen.getByTestId('StrategiesButton')).toBeInTheDocument()
      expect(screen.getByTestId('JourneysButton')).toBeInTheDocument()
      expect(screen.getByTestId('VideosButton')).toBeInTheDocument()
      expect(screen.getByTestId('CalendarButton')).toBeInTheDocument()
      expect(screen.getByTestId('ProductsButton')).toBeInTheDocument()
    })

    it('buttons should have correct links', () => {
      render(<HeaderTabButtons />)
      expect(screen.getByTestId('StrategiesButton')).toHaveAttribute(
        'href',
        '/strategies'
      )
      expect(screen.getByTestId('JourneysButton')).toHaveAttribute(
        'href',
        '/journeys'
      )
      expect(screen.getByTestId('VideosButton')).toHaveAttribute(
        'href',
        '/watch'
      )
      expect(screen.getByTestId('CalendarButton')).toHaveAttribute(
        'href',
        '/calendar'
      )
      expect(screen.getByTestId('ProductsButton')).toHaveAttribute(
        'href',
        '/products'
      )
    })
  })

  // clicking button should naviagate to new link

  describe('dropdown button', () => {
    // beforeEach(() => {
    //   const useBreakpointsMock = useBreakpoints as jest.Mock
    //   useBreakpointsMock.mockReturnValue({
    //     xs: true,
    //     sm: true,
    //     md: true,
    //     lg: false,
    //     xl: false
    //   })
    // })

    it('should render dropdown button', () => {
      render(<HeaderTabButtons />)
      expect(screen.getByTestId('DropDownButton')).toBeInTheDocument()
    })

    it('should open menu on click', () => {
      render(<HeaderTabButtons />)
      const button = screen.getByTestId('DropDownButton')
      fireEvent.click(button)
      expect(
        screen.getByRole('menuitem', { name: 'Strategies' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('menuitem', { name: 'Journeys' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('menuitem', { name: 'Videos' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('menuitem', { name: 'Calendar' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('menuitem', { name: 'Products' })
      ).toBeInTheDocument()
    })

    it('menu buttons should have correct links', () => {
      render(<HeaderTabButtons />)
      const button = screen.getByTestId('DropDownButton')
      fireEvent.click(button)
      expect(
        screen.getByRole('menuitem', { name: 'Strategies' })
      ).toHaveAttribute('href', '/strategies')
      expect(
        screen.getByRole('menuitem', { name: 'Journeys' })
      ).toHaveAttribute('href', '/journeys')
      expect(screen.getByRole('menuitem', { name: 'Videos' })).toHaveAttribute(
        'href',
        '/watch'
      )
      expect(
        screen.getByRole('menuitem', { name: 'Calendar' })
      ).toHaveAttribute('href', '/calendar')
      expect(
        screen.getByRole('menuitem', { name: 'Products' })
      ).toHaveAttribute('href', '/products')
    })
  })
})
