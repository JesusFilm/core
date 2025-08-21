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
    const { getByRole, getAllByRole, getByText } = render(
      <SnackbarProvider>
        <MockedProvider addTypename mocks={mocks}>
          <AccessDialog journeyId="journeyId" open onClose={handleClose} />
        </MockedProvider>
      </SnackbarProvider>
    )

    await waitFor(() => {
      expect(getByText('Team Members')).toBeInTheDocument()
    })

    expect(getByRole('button', { name: 'Manager' })).toBeDisabled()
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

  it('should display header with icons when no team members exist', async () => {
    const mocksNoTeamMembers = [
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
                userTeams: [] // Empty array - no team members
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
            userInvites: []
          }
        }
      }
    ]

    const handleClose = jest.fn()
    const { getByText, queryByText } = render(
      <SnackbarProvider>
        <MockedProvider addTypename mocks={mocksNoTeamMembers}>
          <AccessDialog journeyId="journeyId" open onClose={handleClose} />
        </MockedProvider>
      </SnackbarProvider>
    )

    await waitFor(() => {
      // Header should always be visible
      expect(getByText('Team Members')).toBeInTheDocument()
    })

    // UserTeamList should NOT be rendered when no team members exist
    // We can verify this by checking that no team member names appear
    expect(queryByText('Jotaro Kujo')).not.toBeInTheDocument()
    expect(queryByText('Koichi Hirose')).not.toBeInTheDocument()
    expect(queryByText('Josuke Higashikata')).not.toBeInTheDocument()
  })

  it('should display header for journey owners with no team members', async () => {
    // Create mock for journey owner scenario with empty team
    const mocksJourneyOwner = [
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
                userTeams: [] // Empty team members array
              },
              userJourneys: [
                {
                  __typename: 'UserJourney',
                  id: 'userJourneyId1',
                  role: 'owner', // Current user is journey owner
                  user: {
                    ...user1, // Using the same user that's mocked as current user
                    firstName: 'Owner',
                    lastName: 'User',
                    imageUrl: 'https://bit.ly/3Gth4Yf'
                  },
                  journeyNotification: {
                    id: 'journeyNotificationId',
                    visitorInteractionEmail: true
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
            userInvites: []
          }
        }
      }
    ]

    const handleClose = jest.fn()
    const { getByText, queryByText } = render(
      <SnackbarProvider>
        <MockedProvider addTypename mocks={mocksJourneyOwner}>
          <AccessDialog journeyId="journeyId" open onClose={handleClose} />
        </MockedProvider>
      </SnackbarProvider>
    )

    await waitFor(() => {
      // Header should be visible for journey owners
      expect(getByText('Team Members')).toBeInTheDocument()
    })

    // Verify that the header icons are present by checking for their test IDs
    expect(
      document.querySelector('[data-testid="EmailIcon"]')
    ).toBeInTheDocument()
    expect(
      document.querySelector('[data-testid="ShieldCheckIcon"]')
    ).toBeInTheDocument()

    // No team members should be displayed
    expect(queryByText('Jotaro Kujo')).not.toBeInTheDocument()
    expect(queryByText('Koichi Hirose')).not.toBeInTheDocument()
    expect(queryByText('Josuke Higashikata')).not.toBeInTheDocument()
  })

  it('should display header for guests with no team access', async () => {
    // Create mock for guest user scenario with empty team
    const mocksGuestUser = [
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
                userTeams: [] // Empty team members array
              },
              userJourneys: [
                {
                  __typename: 'UserJourney',
                  id: 'userJourneyId1',
                  role: 'editor', // Guest user with editor role
                  user: {
                    ...user1, // Using the same user that's mocked as current user
                    firstName: 'Guest',
                    lastName: 'User',
                    imageUrl: 'https://bit.ly/3Gth4Yf'
                  },
                  journeyNotification: {
                    id: 'journeyNotificationId',
                    visitorInteractionEmail: true
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
            userInvites: []
          }
        }
      }
    ]

    const handleClose = jest.fn()
    const { getByText, queryByText } = render(
      <SnackbarProvider>
        <MockedProvider addTypename mocks={mocksGuestUser}>
          <AccessDialog journeyId="journeyId" open onClose={handleClose} />
        </MockedProvider>
      </SnackbarProvider>
    )

    await waitFor(() => {
      // Header should be visible for guests
      expect(getByText('Team Members')).toBeInTheDocument()
    })

    // Verify that the header icons are present by checking for their test IDs
    expect(
      document.querySelector('[data-testid="EmailIcon"]')
    ).toBeInTheDocument()
    expect(
      document.querySelector('[data-testid="ShieldCheckIcon"]')
    ).toBeInTheDocument()

    // No team members should be displayed
    expect(queryByText('Jotaro Kujo')).not.toBeInTheDocument()
    expect(queryByText('Koichi Hirose')).not.toBeInTheDocument()
    expect(queryByText('Josuke Higashikata')).not.toBeInTheDocument()
  })

  it('should verify tooltip functionality works regardless of team member presence', async () => {
    // Create mock with empty team members
    const mocksEmptyTeam = [
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
                userTeams: [] // Empty team members array
              },
              userJourneys: [
                {
                  __typename: 'UserJourney',
                  id: 'userJourneyId1',
                  role: 'editor',
                  user: {
                    ...user1,
                    firstName: 'Test',
                    lastName: 'User',
                    imageUrl: 'https://bit.ly/3Gth4Yf'
                  },
                  journeyNotification: {
                    id: 'journeyNotificationId',
                    visitorInteractionEmail: true
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
            userInvites: []
          }
        }
      }
    ]

    const handleClose = jest.fn()
    const { getByText, getAllByRole } = render(
      <SnackbarProvider>
        <MockedProvider addTypename mocks={mocksEmptyTeam}>
          <AccessDialog journeyId="journeyId" open onClose={handleClose} />
        </MockedProvider>
      </SnackbarProvider>
    )

    await waitFor(() => {
      expect(getByText('Team Members')).toBeInTheDocument()
    })

    // Find the tooltip elements by their aria-label attributes
    const emailIcon = document.querySelector('[data-testid="EmailIcon"]')
    const shieldIcon = document.querySelector('[data-testid="ShieldCheckIcon"]')

    expect(emailIcon).toBeInTheDocument()
    expect(shieldIcon).toBeInTheDocument()

    // Verify that tooltips are properly associated with their icons
    // The tooltips are implemented using MUI Tooltip which adds aria-describedby attributes
    expect(
      emailIcon?.closest('[aria-label="Email Notifications"]')
    ).toBeInTheDocument()
    expect(shieldIcon?.closest('[aria-label="User Role"]')).toBeInTheDocument()
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
