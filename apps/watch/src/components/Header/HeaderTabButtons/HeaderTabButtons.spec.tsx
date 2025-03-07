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
      expect(screen.getByTestId('VideosButton')).toBeInTheDocument()
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
      expect(screen.getByTestId('VideosButton')).toHaveAttribute(
        'href',
        '/watch'
      )
    })

    it('should have Videos button selected when on /watch', () => {
      render(
        <ThemeProvider themeName={ThemeName.website} themeMode={ThemeMode.dark}>
          <FlagsProvider flags={{ ...trueHeaderItemsFlags }}>
            <HeaderTabButtons />
          </FlagsProvider>
        </ThemeProvider>
      )
      const router = useRouter()
      expect(router?.pathname).toBe('/watch')

      const videosButton = screen.getByTestId('VideosButton')
      expect(videosButton).toHaveStyle('border-color: #CB333B')

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
        screen.getByRole('menuitem', { name: 'Resources' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('menuitem', { name: 'Journeys' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('menuitem', { name: 'Videos' })
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
      expect(screen.getByRole('menuitem', { name: 'Videos' })).toHaveAttribute(
        'href',
        '/watch'
      )
    })

    it('should have Videos as name of dropdown button when on /watch', () => {
      render(
        <FlagsProvider flags={{ ...trueHeaderItemsFlags }}>
          <HeaderTabButtons />
        </FlagsProvider>
      )
      const router = useRouter()
      expect(router?.pathname).toBe('/watch')

      const button = screen.getByTestId('DropDownButton')
      expect(button).toHaveTextContent('Videos')
    })

    it('should have Videos menu item selected when on /watch', () => {
      render(
        <FlagsProvider flags={{ ...trueHeaderItemsFlags }}>
          <HeaderTabButtons />
        </FlagsProvider>
      )
      const router = useRouter()
      expect(router?.pathname).toBe('/watch')

      const button = screen.getByTestId('DropDownButton')
      fireEvent.click(button)

      const videosMenuItem = screen.getByRole('menuitem', { name: 'Videos' })
      expect(videosMenuItem).toHaveClass('Mui-selected')

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

    it('should not render dropdown button if all flags are false', () => {
      render(
        <FlagsProvider flags={{ ...falseHeaderItemsFlags }}>
          <HeaderTabButtons />
        </FlagsProvider>
      )
      expect(screen.queryByTestId('DropDownButton')).not.toBeInTheDocument()
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
