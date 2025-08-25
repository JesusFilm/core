import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { GET_USER_INVITES } from '../../libs/useUserInvitesLazyQuery/useUserInvitesLazyQuery'

import { AccessDialog, GET_JOURNEY_WITH_PERMISSIONS } from './AccessDialog'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

const user1 = { id: 'userTeamId', email: 'kujojotaro@example.com' }

jest.mock('../../libs/useCurrentUserLazyQuery', () => ({
  __esModule: true,
  useCurrentUserLazyQuery: jest.fn().mockReturnValue({
    loadUser: jest.fn(),
    data: {
      __typename: 'User',
      ...user1
    }
  })
}))

const mocks = [
  {
    request: {
      query: GET_JOURNEY_WITH_PERMISSIONS,
      variables: {
        id: 'journeyId'
      }
    },
    result: {
      data: {
        journey: {
          id: 'journeyId',
          team: {
            __typename: 'Team',
            id: 'teamId',
            userTeams: [
              {
                __typename: 'UserTeam',
                id: 'userTeamId',
                role: 'manager',
                user: {
                  __typename: 'User',
                  email: 'kujojotaro@example.com',
                  firstName: 'Jotaro',
                  id: 'userId',
                  imageUrl:
                    'https://lh3.googleusercontent.com/a/AGNmyxbPtShdH3_xxjpnfHLlo0w-KxDBa9Ah1Qn_ZwpUrA=s96-c',
                  lastName: 'Kujo'
                },
                journeyNotification: {
                  id: 'journeyNotificationId',
                  visitorInteractionEmail: true
                }
              },
              {
                __typename: 'UserTeam',
                id: 'userTeamId1',
                role: 'member',
                user: {
                  __typename: 'User',
                  email: 'josukehigashikata@example.com',
                  firstName: 'Josuke',
                  id: 'userId1',
                  imageUrl: null,
                  lastName: 'Higashikata'
                },
                journeyNotification: {
                  id: 'journeyNotificationId',
                  visitorInteractionEmail: false
                }
              },
              {
                __typename: 'UserTeam',
                id: 'userTeamId2',
                role: 'member',
                user: {
                  __typename: 'User',
                  email: 'KoichiHirose@example.com',
                  firstName: 'Koichi',
                  id: 'userId2',
                  imageUrl: null,
                  lastName: 'Hirose'
                },
                journeyNotification: {
                  id: 'journeyNotificationId',
                  visitorInteractionEmail: true
                }
              }
            ]
          },
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
              },
              journeyNotification: {
                id: 'journeyNotificationId',
                visitorInteractionEmail: true
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
              },
              journeyNotification: {
                id: 'journeyNotificationId',
                visitorInteractionEmail: false
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
              },
              journeyNotification: {
                id: 'journeyNotificationId',
                visitorInteractionEmail: true
              }
            },
            {
              __typename: 'UserJourney',
              id: 'userJourneyId4',
              role: 'editor',
              user: {
                __typename: 'User',
                email: 'kujojotaro@example.com',
                firstName: 'Jotaro',
                id: 'userId',
                imageUrl:
                  'https://lh3.googleusercontent.com/a/AGNmyxbPtShdH3_xxjpnfHLlo0w-KxDBa9Ah1Qn_ZwpUrA=s96-c',
                lastName: 'Kujo'
              },
              journeyNotification: {
                id: 'journeyNotificationId',
                visitorInteractionEmail: false
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
    const { getByRole, getByText } = render(
      <SnackbarProvider>
        <MockedProvider addTypename mocks={mocks}>
          <AccessDialog journeyId="journeyId" open onClose={handleClose} />
        </MockedProvider>
      </SnackbarProvider>
    )

    await waitFor(() => {
      expect(getByText('Guests')).toBeInTheDocument()
      expect(getByText('Requested Access')).toBeInTheDocument()
    })
    expect(getByRole('heading', { name: 'Add editor by' })).toBeInTheDocument()
  })

  it('should not display users that are part of the team as guests', async () => {
    const handleClose = jest.fn()
    const { getByText, getAllByText } = render(
      <SnackbarProvider>
        <MockedProvider addTypename mocks={mocks}>
          <AccessDialog journeyId="journeyId" open onClose={handleClose} />
        </MockedProvider>
      </SnackbarProvider>
    )

    await waitFor(() => {
      expect(getByText('Guests')).toBeInTheDocument()
      expect(getByText('Requested Access')).toBeInTheDocument()
    })
    expect(getAllByText('Jotaro Kujo')).toHaveLength(1)
  })

  it('should display team members', async () => {
    const handleClose = jest.fn()
    const { getByText } = render(
      <SnackbarProvider>
        <MockedProvider addTypename mocks={mocks}>
          <AccessDialog journeyId="journeyId" open onClose={handleClose} />
        </MockedProvider>
      </SnackbarProvider>
    )

    await waitFor(() => {
      expect(getByText('Team Members')).toBeInTheDocument()
      expect(getByText('Jotaro Kujo')).toBeInTheDocument()
      expect(getByText('Koichi Hirose')).toBeInTheDocument()
      expect(getByText('Josuke Higashikata')).toBeInTheDocument()
    })
  })

  it('team members list should be read only', async () => {
    const handleClose = jest.fn()
    const { getAllByRole, getByText } = render(
      <SnackbarProvider>
        <MockedProvider addTypename mocks={mocks}>
          <AccessDialog journeyId="journeyId" open onClose={handleClose} />
        </MockedProvider>
      </SnackbarProvider>
    )

    await waitFor(() => {
      expect(getByText('Team Members')).toBeInTheDocument()
    })

    // Should now have 2 managers: original team manager + synthetic journey owner
    expect(getAllByRole('button', { name: 'Manager' })).toHaveLength(2)
    expect(getAllByRole('button', { name: 'Manager' })[0]).toBeDisabled()
    expect(getAllByRole('button', { name: 'Manager' })[1]).toBeDisabled()
    
    // Should still have 2 members
    expect(getAllByRole('button', { name: 'Member' })).toHaveLength(2)
    expect(getAllByRole('button', { name: 'Member' })[0]).toBeDisabled()
    expect(getAllByRole('button', { name: 'Member' })[1]).toBeDisabled()
  })

  it('if user is part of user team, should filter them out of user journey', async () => {
    const handleClose = jest.fn()
    const { getByText, getAllByText } = render(
      <SnackbarProvider>
        <MockedProvider addTypename mocks={mocks}>
          <AccessDialog journeyId="journeyId" open onClose={handleClose} />
        </MockedProvider>
      </SnackbarProvider>
    )

    await waitFor(() => {
      expect(getByText('Team Members')).toBeInTheDocument()
    })

    expect(getAllByText('Jotaro Kujo')).toHaveLength(1)
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
