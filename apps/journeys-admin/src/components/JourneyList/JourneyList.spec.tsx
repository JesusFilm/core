import { render, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { SnackbarProvider } from 'notistack'
import { NextRouter } from 'next/router'
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
  it('should render tab panel', () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider>
          <ThemeProvider>
            <JourneyList
              journeys={[defaultJourney, publishedJourney, oldJourney]}
              event=""
            />
          </ThemeProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(getByRole('tablist')).toBeInTheDocument()
  })

  it('should show access denied message to new user', () => {
    const { getByText, getByRole, queryByText } = render(
      <SnackbarProvider>
        <MockedProvider>
          <ThemeProvider>
            <JourneyList journeys={[]} event="" />
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

  it('should render report', async () => {
    const { getByTestId } = render(
      <SnackbarProvider>
        <MockedProvider>
          <ThemeProvider>
            <JourneyList
              journeys={[defaultJourney, publishedJourney, oldJourney]}
              event=""
            />
          </ThemeProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    await waitFor(() =>
      expect(getByTestId('powerBi-multipleSummary-report')).toBeInTheDocument()
    )
  })

  it('should hide report if the user has no journeys', async () => {
    const { queryByTestId } = render(
      <SnackbarProvider>
        <MockedProvider>
          <ThemeProvider>
            <JourneyList journeys={[]} event="" />
          </ThemeProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    await waitFor(() =>
      expect(queryByTestId('powerBi-multipleSummary-report')).toBeNull()
    )
  })

  it('should show add journey button', () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider>
          <ThemeProvider>
            <JourneyList
              journeys={[defaultJourney, publishedJourney, oldJourney]}
              event=""
            />
          </ThemeProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(getByRole('button', { name: 'Add' })).toBeInTheDocument()
  })

  it('should show add journey button', () => {
    const router = { query: { tab: 'active' } } as unknown as NextRouter
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider>
          <ThemeProvider>
            <JourneyList
              journeys={[defaultJourney, publishedJourney, oldJourney]}
              router={router}
              event=""
            />
          </ThemeProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(getByRole('button', { name: 'Add' })).toBeInTheDocument()
  })

  it('should hide add journey button', () => {
    const router = { query: { tab: 'trashed' } } as unknown as NextRouter
    const { queryByRole } = render(
      <SnackbarProvider>
        <MockedProvider>
          <ThemeProvider>
            <JourneyList
              journeys={[defaultJourney, publishedJourney, oldJourney]}
              event=""
              router={router}
            />
          </ThemeProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(queryByRole('button', { name: 'Add' })).toBeNull()
  })

  it('should hide add journey button', () => {
    const router = { query: { tab: 'archived' } } as unknown as NextRouter
    const { queryByRole } = render(
      <SnackbarProvider>
        <MockedProvider>
          <ThemeProvider>
            <JourneyList
              journeys={[defaultJourney, publishedJourney, oldJourney]}
              router={router}
              event=""
            />
          </ThemeProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(queryByRole('button', { name: 'Add' })).toBeNull()
  })
})
