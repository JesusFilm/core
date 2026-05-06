import { fireEvent, render, screen } from '@testing-library/react'
import { useRouter } from 'next/compat/router'

import { FlagsProvider } from '@core/shared/ui/FlagsProvider'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

import { HeaderTabButtons } from './HeaderTabButtons'

jest.mock('next/compat/router', () => ({
  __esModule: true,
  useRouter() {
    return { pathname: '/watch' }
  }
}))

describe('HeaderTabButtons', () => {
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
      expect(screen.getByTestId('ResourcesButton')).toBeInTheDocument()
      expect(screen.getByTestId('JourneysButton')).toBeInTheDocument()
      expect(screen.getByTestId('WatchButton')).toBeInTheDocument()
      expect(screen.getByTestId('MetaverseButton')).toBeInTheDocument()
    })

    it('buttons should have correct links', () => {
      render(
        <FlagsProvider flags={{ ...trueHeaderItemsFlags }}>
          <HeaderTabButtons />
        </FlagsProvider>
      )
      expect(screen.getByTestId('ResourcesButton')).toHaveAttribute(
        'href',
        '/resources'
      )
      expect(screen.getByTestId('JourneysButton')).toHaveAttribute(
        'href',
        '/journeys'
      )
      expect(screen.getByTestId('WatchButton')).toHaveAttribute(
        'href',
        '/watch'
      )
      expect(screen.getByTestId('MetaverseButton')).toHaveAttribute(
        'href',
        'https://www.jesusfilm.org/metaverse/'
      )
    })

    it('should have Watch button selected when on /watch', () => {
      render(
        <ThemeProvider themeName={ThemeName.website} themeMode={ThemeMode.dark}>
          <FlagsProvider flags={{ ...trueHeaderItemsFlags }}>
            <HeaderTabButtons />
          </FlagsProvider>
        </ThemeProvider>
      )
      const router = useRouter()
      expect(router?.pathname).toBe('/watch')

      const watchButton = screen.getByTestId('WatchButton')
      expect(watchButton).toHaveStyle('border-color: #CB333B')

      // other buttons shouldn't have red border
      const journeysButton = screen.getByTestId('JourneysButton')
      expect(journeysButton).toHaveStyle('border-color: transparent')
    })

    it('should not render products button if products flag is false', () => {
      render(
        <FlagsProvider flags={{ ...trueHeaderItemsFlags, products: false }}>
          <HeaderTabButtons />
        </FlagsProvider>
      )
      expect(screen.queryByTestId('ProductsButton')).not.toBeInTheDocument()
    })

    it('should only render Watch and Metaverse buttons if all flags are false', () => {
      render(
        <FlagsProvider flags={{ ...falseHeaderItemsFlags }}>
          <HeaderTabButtons />
        </FlagsProvider>
      )
      expect(screen.getByTestId('HeaderTabButtons')).toBeInTheDocument()
      expect(screen.getByTestId('WatchButton')).toBeInTheDocument()
      expect(screen.getByTestId('MetaverseButton')).toBeInTheDocument()
      expect(screen.queryByTestId('ResourcesButton')).not.toBeInTheDocument()
      expect(screen.queryByTestId('JourneysButton')).not.toBeInTheDocument()
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
        screen.getByRole('menuitem', { name: 'Resources' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('menuitem', { name: 'Journeys' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('menuitem', { name: 'Watch' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('menuitem', { name: 'Metaverse' })
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
        screen.getByRole('menuitem', { name: 'Resources' })
      ).toHaveAttribute('href', '/resources')
      expect(
        screen.getByRole('menuitem', { name: 'Journeys' })
      ).toHaveAttribute('href', '/journeys')
      expect(screen.getByRole('menuitem', { name: 'Watch' })).toHaveAttribute(
        'href',
        '/watch'
      )
      expect(
        screen.getByRole('menuitem', { name: 'Metaverse' })
      ).toHaveAttribute('href', 'https://www.jesusfilm.org/metaverse/')
    })

    it('should have Watch as name of dropdown button when on /watch', () => {
      render(
        <FlagsProvider flags={{ ...trueHeaderItemsFlags }}>
          <HeaderTabButtons />
        </FlagsProvider>
      )
      const router = useRouter()
      expect(router?.pathname).toBe('/watch')

      const button = screen.getByTestId('DropDownButton')
      expect(button).toHaveTextContent('Watch')
    })

    it('should have Watch menu item selected when on /watch', () => {
      render(
        <FlagsProvider flags={{ ...trueHeaderItemsFlags }}>
          <HeaderTabButtons />
        </FlagsProvider>
      )
      const router = useRouter()
      expect(router?.pathname).toBe('/watch')

      const button = screen.getByTestId('DropDownButton')
      fireEvent.click(button)

      const watchMenuItem = screen.getByRole('menuitem', { name: 'Watch' })
      expect(watchMenuItem).toHaveClass('Mui-selected')

      // other menu items shouldn't be selected
      const journeysMenuItem = screen.getByRole('menuitem', {
        name: 'Journeys'
      })
      expect(journeysMenuItem).not.toHaveClass('Mui-selected')
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

    it('should render dropdown button with Watch and Metaverse if all flags are false', () => {
      render(
        <FlagsProvider flags={{ ...falseHeaderItemsFlags }}>
          <HeaderTabButtons />
        </FlagsProvider>
      )
      expect(screen.getByTestId('DropDownButton')).toBeInTheDocument()
      fireEvent.click(screen.getByTestId('DropDownButton'))
      expect(
        screen.getByRole('menuitem', { name: 'Watch' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('menuitem', { name: 'Metaverse' })
      ).toBeInTheDocument()
      expect(
        screen.queryByRole('menuitem', { name: 'Resources' })
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole('menuitem', { name: 'Journeys' })
      ).not.toBeInTheDocument()
    })

    it('should use fallback values when current route does not match any headerItems', () => {
      jest
        .spyOn(require('next/compat/router'), 'useRouter')
        .mockImplementationOnce(() => ({
          pathname: '/unknown-route'
        }))

      render(
        <FlagsProvider flags={{ ...trueHeaderItemsFlags }}>
          <HeaderTabButtons />
        </FlagsProvider>
      )

      const button = screen.getByTestId('DropDownButton')
      expect(button).toHaveTextContent('')
      expect(button).toBeInTheDocument()
    })
  })
})
