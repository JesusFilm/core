import { render } from '@testing-library/react'
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
