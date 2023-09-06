import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { UserJourneyRole } from '../../../__generated__/globalTypes'
import { ThemeProvider } from '../ThemeProvider'

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

  it('should use first name and last as tooltip', async () => {
    const { getByRole } = render(
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
    fireEvent.focusIn(getByRole('img', { name: 'Janelle Five' }))
    await waitFor(() =>
      expect(getByRole('tooltip', { name: 'Janelle Five' })).toBeInTheDocument()
    )
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
    expect(queryByText('Manage Editors')).toBeInTheDocument()
    fireEvent.click(getByTestId('dialog-close-button'))
    await waitFor(() =>
      expect(queryByText('Manage Editors')).not.toBeInTheDocument()
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

  it('should show manage button', async () => {
    const { queryAllByLabelText } = render(
      <SnackbarProvider>
        <MockedProvider>
          <ThemeProvider>
            <AccessAvatars
              journeyId="journeyId"
              userJourneys={[userJourney1]}
              showManageButton
            />
          </ThemeProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    expect(queryAllByLabelText('Manage Access')).toHaveLength(2)
  })

  it('should display owner of journey first', async () => {
    const ownerUser = {
      ...userJourney2,
      role: UserJourneyRole.owner
    }
    const editorUser1 = {
      ...userJourney1,
      role: UserJourneyRole.editor
    }
    const editorUser2 = {
      ...userJourney4,
      role: UserJourneyRole.editor
    }
    const inviteRequestedUser = {
      ...userJourney3,
      role: UserJourneyRole.inviteRequested
    }

    const { getAllByRole } = render(
      <SnackbarProvider>
        <MockedProvider>
          <ThemeProvider>
            <AccessAvatars
              journeyId="journeyId"
              userJourneys={[
                editorUser1,
                editorUser2,
                inviteRequestedUser,
                ownerUser
              ]}
            />
          </ThemeProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    // expect the owner, Horace Two, to be at the final index for both mobile and desktop, as it is the first index displayed to the user
    expect(
      getAllByRole('img').map((element) => element.getAttribute('alt'))
    ).toEqual([
      // Mobile
      'Amin One',
      'Horace Two',
      // Desktop
      'Coral Three',
      'Effie Four',
      'Amin One',
      'Horace Two'
    ])
  })
})
