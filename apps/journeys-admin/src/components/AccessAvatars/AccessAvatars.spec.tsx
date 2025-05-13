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
    expect(getByAltText('Horace Two')).toBeInTheDocument()
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
    fireEvent.mouseOver(getByRole('img', { name: 'Horace Two' }))
    await waitFor(() =>
      expect(getByRole('tooltip', { name: 'Horace Two' })).toBeInTheDocument()
    )
  })

  it('should display multiple (3) avatars', () => {
    const { getAllByRole } = render(
      <SnackbarProvider>
        <MockedProvider>
          <ThemeProvider>
            <AccessAvatars
              journeyId="journeyId"
              userJourneys={[userJourney1, userJourney2, userJourney3]}
            />
          </ThemeProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(
      getAllByRole('img').map((element) => element.getAttribute('alt'))
    ).toEqual(['Coral Three', 'Horace Two', 'Amin One'])
  })

  it('should display 2 valid avatars max when >3 avatars exist for journey', () => {
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
                userJourney5
              ]}
            />
          </ThemeProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(
      getAllByRole('img').map((element) => element.getAttribute('alt'))
    ).toEqual(['Horace Two', 'Amin One'])
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
    await waitFor(() =>
      expect(queryByText('Manage Editors')).toBeInTheDocument()
    )
    fireEvent.click(getByTestId('dialog-close-button'))
    await waitFor(() =>
      expect(queryByText('Manage Editors')).not.toBeInTheDocument()
    )
  })

  it('should show alternative tooltip for user with requested access', async () => {
    const inviteRequestedUserJourney = {
      ...userJourney6,
      role: UserJourneyRole.inviteRequested
    }
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider>
          <ThemeProvider>
            <AccessAvatars
              journeyId="journeyId"
              userJourneys={[
                userJourney1,
                userJourney2,
                inviteRequestedUserJourney
              ]}
            />
          </ThemeProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    fireEvent.mouseOver(getByRole('img', { name: 'Drake Six' }))
    await waitFor(() =>
      expect(
        getByRole('tooltip', { name: 'User with Requested Access' })
      ).toBeInTheDocument()
    )
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
    // expect the owner, Horace Two, to be at the final index as it is the first index displayed to the user
    expect(
      getAllByRole('img').map((element) => element.getAttribute('alt'))
    ).toEqual(['Amin One', 'Horace Two'])
  })

  it('should show +N on the third avatar when there are more than 3 users', () => {
    const { getByText } = render(
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
    expect(getByText('+3')).toBeInTheDocument()
  })
})
