import { render, fireEvent } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { SnackbarProvider } from 'notistack'
import { ThemeProvider } from '../ThemeProvider'
import { defaultJourney, publishedJourney, oldJourney } from './journeyListData'
import { JourneyList } from '.'

describe('JourneyList', () => {
  it('should render journeys in descending createdAt date by default', () => {
    const { getAllByLabelText } = render(
      <SnackbarProvider>
        <MockedProvider>
          <ThemeProvider>
            <JourneyList journeys={[defaultJourney, oldJourney]} />
          </ThemeProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    const journeyCards = getAllByLabelText('journey-card')

    expect(journeyCards[0].textContent).toContain('January 1')
    expect(journeyCards[1].textContent).toContain('November 19, 2020')
  })

  it('should order journeys in alphabetical order', () => {
    const { getAllByLabelText, getByRole } = render(
      <SnackbarProvider>
        <MockedProvider>
          <ThemeProvider>
            <JourneyList journeys={[defaultJourney, oldJourney]} />
          </ThemeProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    const journeyCards = getAllByLabelText('journey-card')

    fireEvent.click(getByRole('button', { name: 'Sort By' }))
    fireEvent.click(getByRole('radio', { name: 'Name' }))

    expect(journeyCards[0].textContent).toContain('An Old Journey Heading')
    expect(journeyCards[1].textContent).toContain('Default Journey Heading')
  })

  it('should render all journeys', () => {
    const { getAllByLabelText } = render(
      <SnackbarProvider>
        <MockedProvider>
          <ThemeProvider>
            <JourneyList
              journeys={[defaultJourney, publishedJourney, oldJourney]}
            />
          </ThemeProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(getAllByLabelText('journey-card').length).toBe(3)
  })

  it('should render text when there are no journeys', () => {
    const { getByText, getByRole } = render(
      <SnackbarProvider>
        <MockedProvider>
          <ThemeProvider>
            <JourneyList journeys={[]} />
          </ThemeProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    expect(getByText('No journeys to display.')).toBeInTheDocument()
    expect(
      getByText('Create a journey, then find it here.')
    ).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'Create a Journey' })
    ).toBeInTheDocument()
  })
})
