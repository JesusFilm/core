import { render, fireEvent } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { SnackbarProvider } from 'notistack'
import { ThemeProvider } from '../ThemeProvider'
import { defaultJourney, publishedJourney, oldJourney } from './journeyListData'
import { JourneyList } from '.'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: () => {
    return {
      query: {
        tab: 'active'
      },
      push: jest.fn()
    }
  }
}))

describe('JourneyList', () => {
  it.skip('should render journeys in descending createdAt date by default', () => {
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

  it.skip('should order journeys in alphabetical order', () => {
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

    expect(journeyCards[0].textContent).toContain('Default Journey Heading')
    expect(journeyCards[1].textContent).toContain('An Old Journey Heading')
  })

  it('should render tab panel', () => {
    const { getByRole } = render(
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
    expect(getByRole('tablist')).toBeInTheDocument()
  })

  it('should prevent users from creating a journey unless invited', () => {
    const { getByText, getByRole, queryByText } = render(
      <SnackbarProvider>
        <MockedProvider>
          <ThemeProvider>
            <JourneyList journeys={[]} disableCreation />
          </ThemeProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(queryByText('All Journeys')).not.toBeInTheDocument()
    expect(
      getByText('You need to be invited to create the first journey')
    ).toBeInTheDocument()
    expect(
      getByText(
        'Someone with a full account should add you to their journey as an editor, after that you will have full access'
      )
    ).toBeInTheDocument()
    expect(getByRole('button', { name: 'Contact Support' })).toBeInTheDocument()
  })
})
