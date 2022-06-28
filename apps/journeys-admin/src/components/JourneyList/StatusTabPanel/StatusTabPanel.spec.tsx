import { render, fireEvent } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import useMediaQuery from '@mui/material/useMediaQuery'
import { SnackbarProvider } from 'notistack'
import { defaultJourney, oldJourney } from '../journeyListData'
import { ThemeProvider } from '../../ThemeProvider'
import { StatusTabPanel } from './StatusTabPanel'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('StatusTabPanel', () => {
  describe('journeys list', () => {
    beforeEach(() =>
      (useMediaQuery as jest.Mock).mockImplementation(() => true)
    )

    it('should render journeys in descending createdAt date by default', () => {
      const { getAllByLabelText } = render(
        <MockedProvider>
          <SnackbarProvider>
            <ThemeProvider>
              <StatusTabPanel journeys={[defaultJourney, oldJourney]} />
            </ThemeProvider>
          </SnackbarProvider>
        </MockedProvider>
      )

      const journeyCards = getAllByLabelText('journey-card')

      expect(journeyCards[0].textContent).toContain('January 1')
      expect(journeyCards[1].textContent).toContain('November 19, 2020')
    })

    it('should order journeys in alphabetical order', () => {
      const { getAllByLabelText, getByRole } = render(
        <MockedProvider>
          <SnackbarProvider>
            <ThemeProvider>
              <StatusTabPanel journeys={[defaultJourney, oldJourney]} />
            </ThemeProvider>
          </SnackbarProvider>
        </MockedProvider>
      )

      const journeyCards = getAllByLabelText('journey-card')

      fireEvent.click(getByRole('button', { name: 'Sort By' }))
      fireEvent.click(getByRole('radio', { name: 'Name' }))

      expect(journeyCards[0].textContent).toContain('Default Journey Heading')
      expect(journeyCards[1].textContent).toContain('An Old Journey Heading')
    })

    it('should render skeleton tab panel', () => {
      const { getByTestId } = render(
        <MockedProvider>
          <ThemeProvider>
            <StatusTabPanel journeys={undefined} />
          </ThemeProvider>
        </MockedProvider>
      )
      expect(getByTestId('skeleton-journey-list')).toBeInTheDocument()
    })
  })

  describe('tab panel', () => {
    it('should not change tab if clicking a already selected tab', () => {
      const { getByRole } = render(
        <MockedProvider>
          <SnackbarProvider>
            <ThemeProvider>
              <StatusTabPanel journeys={[defaultJourney, oldJourney]} />
            </ThemeProvider>
          </SnackbarProvider>
        </MockedProvider>
      )
      expect(getByRole('tab')).toHaveAttribute('aria-selected', 'true')
      fireEvent.click(getByRole('tab', { name: 'Active' }))
      expect(getByRole('tab')).toHaveAttribute('aria-selected', 'true')
    })
  })
})
