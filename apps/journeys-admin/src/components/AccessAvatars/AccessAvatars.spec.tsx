import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { ThemeProvider } from '../ThemeProvider'
import { UserJourneyRole } from '../../../__generated__/globalTypes'
import {
  userJourney1,
  userJourney2,
  userJourney3,
  userJourney4,
  userJourney5,
  userJourney6
} from './data'
import { AccessAvatars } from '.'

describe('AccessAvatars', () => {
  it('should use first name as image alt', () => {
    const { getByAltText } = render(
      <SnackbarProvider>
        <MockedProvider>
          <ThemeProvider>
            <AccessAvatars
              journeyId="journeyId"
              userJourneys={[
                userJourney1,
                userJourney2,
                userJourney3,
                userJourney4,
                userJourney5
              ]}
            />
          </ThemeProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(getByAltText('Janelle Five')).toBeInTheDocument()
  })

  it('should use first name and last as tooltip', () => {
    const { getByLabelText } = render(
      <SnackbarProvider>
        <MockedProvider>
          <ThemeProvider>
            <AccessAvatars
              journeyId="journeyId"
              userJourneys={[
                userJourney1,
                userJourney2,
                userJourney3,
                userJourney4,
                userJourney5
              ]}
            />
          </ThemeProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(getByLabelText('Janelle Five')).toBeInTheDocument()
  })

  it('should display 2 mobile and 4 desktop avatars max', () => {
    const { getAllByRole } = render(
      <SnackbarProvider>
        <MockedProvider>
          <ThemeProvider>
            <AccessAvatars
              journeyId="journeyId"
              userJourneys={[
                userJourney1,
                userJourney2,
                userJourney3,
                userJourney4,
                userJourney5,
                userJourney6
              ]}
            />
          </ThemeProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(
      getAllByRole('img').map((element) => element.getAttribute('alt'))
    ).toEqual([
      // Mobile
      'Horace Two',
      'Amin One',
      // Desktop
      'Effie Four',
      'Coral Three',
      'Horace Two',
      'Amin One'
    ])
  })

  it('should show access dialog on click', async () => {
    const { getAllByRole, queryByText, getByTestId } = render(
      <SnackbarProvider>
        <MockedProvider>
          <ThemeProvider>
            <AccessAvatars
              journeyId="journeyId"
              userJourneys={[userJourney1]}
            />
          </ThemeProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    fireEvent.click(getAllByRole('button')[0])
    expect(queryByText('Invite Other Editors')).toBeInTheDocument()
    fireEvent.click(getByTestId('dialog-close-button'))
    await waitFor(() =>
      expect(queryByText('Invite Other Editors')).not.toBeInTheDocument()
    )
  })

  it('should show notification badge', () => {
    const inviteRequestedUserJourney = {
      ...userJourney6,
      role: UserJourneyRole.inviteRequested
    }
    const { getAllByLabelText } = render(
      <SnackbarProvider>
        <MockedProvider>
          <ThemeProvider>
            <AccessAvatars
              journeyId="journeyId"
              userJourneys={[
                userJourney1,
                userJourney2,
                userJourney3,
                userJourney4,
                userJourney5,
                inviteRequestedUserJourney
              ]}
            />
          </ThemeProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(getAllByLabelText('overflow-notification-badge')).toHaveLength(2)
  })
})
