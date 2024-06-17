import { fireEvent, render, screen } from '@testing-library/react'

import { FlagsProvider } from '@core/shared/ui/FlagsProvider'

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

  const trueHeaderItemsFlags = {
    strategies: true,
    journeys: true,
    calendar: true,
    products: true
  }

  const falseHeaderItemsFlags = {
    strategies: false,
    journeys: false,
    calendar: false,
    products: false
  }

  describe('tab buttons', () => {
    it('should render headertabbuttons', () => {
      render(
        <FlagsProvider flags={{ ...trueHeaderItemsFlags }}>
          <HeaderTabButtons />
        </FlagsProvider>
      )
      expect(screen.getByTestId('HeaderTabButtons')).toBeInTheDocument()
      expect(screen.getByTestId('StrategiesButton')).toBeInTheDocument()
      expect(screen.getByTestId('JourneysButton')).toBeInTheDocument()
      expect(screen.getByTestId('VideosButton')).toBeInTheDocument()
      expect(screen.getByTestId('CalendarButton')).toBeInTheDocument()
      expect(screen.getByTestId('ProductsButton')).toBeInTheDocument()
    })

    it('buttons should have correct links', () => {
      render(
        <FlagsProvider flags={{ ...trueHeaderItemsFlags }}>
          <HeaderTabButtons />
        </FlagsProvider>
      )
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

    it('should not render products button if products flag is false', () => {
      render(
        <FlagsProvider flags={{ ...trueHeaderItemsFlags, products: false }}>
          <HeaderTabButtons />
        </FlagsProvider>
      )
      expect(screen.queryByTestId('ProductsButton')).not.toBeInTheDocument()
    })

    it('should not render tab buttons if all flags are false', () => {
      render(
        <FlagsProvider flags={{ ...falseHeaderItemsFlags }}>
          <HeaderTabButtons />
        </FlagsProvider>
      )
      expect(screen.queryByTestId('HeaderTabButtons')).not.toBeInTheDocument()
    })
  })

  describe('dropdown button', () => {
    it('should render dropdown button', () => {
      render(
        <FlagsProvider flags={{ ...trueHeaderItemsFlags }}>
          <HeaderTabButtons />
        </FlagsProvider>
      )
      expect(screen.getByTestId('DropDownButton')).toBeInTheDocument()
    })

    it('should open menu on click', () => {
      render(
        <FlagsProvider flags={{ ...trueHeaderItemsFlags }}>
          <HeaderTabButtons />
        </FlagsProvider>
      )
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
      render(
        <FlagsProvider flags={{ ...trueHeaderItemsFlags }}>
          <HeaderTabButtons />
        </FlagsProvider>
      )
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

    it('should not render products menu item if products flag is false', () => {
      render(
        <FlagsProvider flags={{ ...trueHeaderItemsFlags, products: false }}>
          <HeaderTabButtons />
        </FlagsProvider>
      )
      expect(
        screen.queryByRole('menuitem', { name: 'Products' })
      ).not.toBeInTheDocument()
    })

    it('should not render dropdown button if all flags are false', () => {
      render(
        <FlagsProvider flags={{ ...falseHeaderItemsFlags }}>
          <HeaderTabButtons />
        </FlagsProvider>
      )
      expect(screen.queryByTestId('DropDownButton')).not.toBeInTheDocument()
    })
  })
})
