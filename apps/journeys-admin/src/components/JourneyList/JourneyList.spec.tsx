import { render, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { SnackbarProvider } from 'notistack'
import { NextRouter } from 'next/router'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'
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

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

describe('JourneyList', () => {
  it('should render tab panel', () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <FlagsProvider>
          <MockedProvider>
            <ThemeProvider>
              <JourneyList
                journeys={[defaultJourney, publishedJourney, oldJourney]}
                event=""
              />
            </ThemeProvider>
          </MockedProvider>
        </FlagsProvider>
      </SnackbarProvider>
    )
    expect(getByRole('tablist')).toBeInTheDocument()
  })

  it('should show access denied message to new user', () => {
    const { getByText, getByRole, queryByText } = render(
      <SnackbarProvider>
        <FlagsProvider flags={{ inviteRequirement: true }}>
          <MockedProvider>
            <ThemeProvider>
              <JourneyList journeys={[]} event="" />
            </ThemeProvider>
          </MockedProvider>
        </FlagsProvider>
      </SnackbarProvider>
    )
    expect(queryByText('All Journeys')).not.toBeInTheDocument()
    expect(
      getByText('You need to be invited to use your first journey')
    ).toBeInTheDocument()
    expect(
      getByText(
        'Someone with a full account should add you to their journey as an editor, after that you will have full access'
      )
    ).toBeInTheDocument()
    expect(getByRole('link', { name: 'Contact Support' })).toBeInTheDocument()
  })

  it('should render report', async () => {
    const { getByTestId } = render(
      <SnackbarProvider>
        <FlagsProvider flags={{ journeysSummaryReport: true }}>
          <MockedProvider>
            <ThemeProvider>
              <JourneyList
                journeys={[defaultJourney, publishedJourney, oldJourney]}
                event=""
              />
            </ThemeProvider>
          </MockedProvider>
        </FlagsProvider>
      </SnackbarProvider>
    )
    await waitFor(() =>
      expect(getByTestId('powerBi-multipleSummary-report')).toBeInTheDocument()
    )
  })

  it('should hide report if the user has no journeys', async () => {
    const { queryByTestId } = render(
      <SnackbarProvider>
        <FlagsProvider flags={{ journeysSummaryReport: true }}>
          <MockedProvider>
            <ThemeProvider>
              <JourneyList journeys={[]} event="" />
            </ThemeProvider>
          </MockedProvider>
        </FlagsProvider>
      </SnackbarProvider>
    )
    await waitFor(() =>
      expect(queryByTestId('powerBi-multipleSummary-report')).toBeNull()
    )
  })

  it('should show add journey button', () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <FlagsProvider>
          <MockedProvider>
            <ThemeProvider>
              <JourneyList
                journeys={[defaultJourney, publishedJourney, oldJourney]}
                event=""
              />
            </ThemeProvider>
          </MockedProvider>
        </FlagsProvider>
      </SnackbarProvider>
    )
    expect(getByRole('button', { name: 'Add' })).toBeInTheDocument()
  })

  it('should show add journey button', () => {
    const router = { query: { tab: 'active' } } as unknown as NextRouter
    const { getByRole } = render(
      <SnackbarProvider>
        <FlagsProvider>
          <MockedProvider>
            <ThemeProvider>
              <JourneyList
                journeys={[defaultJourney, publishedJourney, oldJourney]}
                router={router}
                event=""
              />
            </ThemeProvider>
          </MockedProvider>
        </FlagsProvider>
      </SnackbarProvider>
    )
    expect(getByRole('button', { name: 'Add' })).toBeInTheDocument()
  })

  it('should hide add journey button', () => {
    const router = { query: { tab: 'trashed' } } as unknown as NextRouter
    const { queryByRole } = render(
      <SnackbarProvider>
        <FlagsProvider>
          <MockedProvider>
            <ThemeProvider>
              <JourneyList
                journeys={[defaultJourney, publishedJourney, oldJourney]}
                event=""
                router={router}
              />
            </ThemeProvider>
          </MockedProvider>
        </FlagsProvider>
      </SnackbarProvider>
    )
    expect(queryByRole('button', { name: 'Add' })).toBeNull()
  })

  it('should hide add journey button', () => {
    const router = { query: { tab: 'archived' } } as unknown as NextRouter
    const { queryByRole } = render(
      <SnackbarProvider>
        <FlagsProvider>
          <MockedProvider>
            <ThemeProvider>
              <JourneyList
                journeys={[defaultJourney, publishedJourney, oldJourney]}
                router={router}
                event=""
              />
            </ThemeProvider>
          </MockedProvider>
        </FlagsProvider>
      </SnackbarProvider>
    )
    expect(queryByRole('button', { name: 'Add' })).toBeNull()
  })
})
