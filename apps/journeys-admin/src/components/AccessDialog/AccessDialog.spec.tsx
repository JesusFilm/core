import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { GET_USER_INVITES } from '../../libs/useUserInvitesLazyQuery/useUserInvitesLazyQuery'

import { AccessDialog, GET_JOURNEY_WITH_USER_JOURNEYS } from './AccessDialog'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

const user1 = { id: 'userId1', email: 'admin@email.com' }

jest.mock('../../libs/useCurrentUser', () => ({
  __esModule: true,
  useCurrentUser: jest.fn().mockReturnValue({
    loadUser: jest.fn(),
    data: {
      __typename: 'User',
      ...user1
    }
  })
}))

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

const mocks = [
  {
    request: {
      query: GET_JOURNEY_WITH_USER_JOURNEYS,
      variables: {
        id: 'journeyId'
      }
    },
    result: {
      data: {
        journey: {
          id: 'journeyId',
          userJourneys: [
            {
              __typename: 'UserJourney',
              id: 'userJourneyId1',
              role: 'owner',
              user: {
                ...user1,
                firstName: 'Amin',
                lastName: 'One',
                imageUrl: 'https://bit.ly/3Gth4Yf'
              }
            },
            {
              __typename: 'UserJourney',
              id: 'userJourneyId2',
              role: 'editor',
              user: {
                id: 'userId2',
                firstName: 'Horace',
                lastName: 'Two',
                imageUrl: 'https://bit.ly/3rgHd6a',
                email: 'horace@email.com'
              }
            },
            {
              __typename: 'UserJourney',
              id: 'userJourneyId3',
              role: 'inviteRequested',
              user: {
                id: 'userId3',
                firstName: 'Coral',
                lastName: 'Three',
                imageUrl: 'https://bit.ly/3nlwUwJ',
                email: 'coral@email.com'
              }
            }
          ]
        }
      }
    }
  },
  {
    request: {
      query: GET_USER_INVITES,
      variables: {
        journeyId: 'journeyId'
      }
    },
    result: {
      data: {
        userInvites: [
          {
            __typename: 'UserInvite',
            id: 'invite.id',
            journeyId: 'journey.id',
            email: 'invite@email.com',
            acceptedAt: null,
            removedAt: null
          }
        ]
      }
    }
  }
]

describe('AccessDialog', () => {
  it('should display users and requested users', async () => {
    const handleClose = jest.fn()
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider addTypename mocks={mocks}>
          <AccessDialog journeyId="journeyId" open onClose={handleClose} />
        </MockedProvider>
      </SnackbarProvider>
    )

    await waitFor(() => {
      expect(getByRole('heading', { name: 'Editors' })).toBeInTheDocument()
      expect(
        getByRole('heading', { name: 'Requested Access' })
      ).toBeInTheDocument()
    })
    expect(getByRole('heading', { name: 'Add editor by' })).toBeInTheDocument()
  })

  it('calls on close', () => {
    const handleClose = jest.fn()
    const { getByTestId } = render(
      <SnackbarProvider>
        <MockedProvider>
          <AccessDialog journeyId="journeyId" open onClose={handleClose} />
        </MockedProvider>
      </SnackbarProvider>
    )
    fireEvent.click(getByTestId('dialog-close-button'))
    expect(handleClose).toHaveBeenCalled()
  })
})
