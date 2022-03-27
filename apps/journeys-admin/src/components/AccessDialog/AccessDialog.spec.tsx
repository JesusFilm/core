import type { ComponentType } from 'react'
import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { useAuthUser, withAuthUser } from 'next-firebase-auth'
import { UserJourneyRole } from '../../../__generated__/globalTypes'
import { AccessDialog, GET_JOURNEY_WITH_USER_JOURNEYS } from './AccessDialog'
import { USER_JOURNEY_APPROVE } from './ApproveUser/ApproveUser'
import { USER_JOURNEY_PROMOTE } from './PromoteUser/PromoteUser'
import { USER_JOURNEY_REMOVE } from './RemoveUser/RemoveUser'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

const mockFirebaseUser = {
  displayName: 'Banana Manana',
  // ... other fields from firebaseUser that you may use
}

const getMockAuthUser = (isLoggedIn = true) => ({
  id: isLoggedIn ? 'userId1' : null,
  email: isLoggedIn ? 'amin@email.com' : null,
  emailVerified: isLoggedIn,
  getIdToken: jest.fn(async () => (isLoggedIn ? 'i_am_a_token' : null)),
  clientInitialized: isLoggedIn,
  firebaseUser: isLoggedIn ? mockFirebaseUser : null,
  signOut: jest.fn(),
  serialize: jest.fn(() => 'serialized_auth_user'),
})

jest.mock('next-firebase-auth')

const mocks = [
  {
    request: {
      query: GET_JOURNEY_WITH_USER_JOURNEYS,
      variables: {
        id: 'journeySlug'
      }
    },
    result: {
      data: {
        journey: {
          id: 'journeyId',
          __typename: 'Journey',
          userJourneys: [
            {
              id: 'userJourneyId1',
              __typename: 'UserJourney',
              role: UserJourneyRole.owner,
              user: {
                id: 'userId1',
                __typename: 'User',
                firstName: 'Amin',
                lastName: 'One',
                imageUrl: 'https://bit.ly/3Gth4Yf',
                email: 'amin@email.com'
              }
            },
            {
              id: 'userJourneyId2',
              __typename: 'UserJourney',
              role: UserJourneyRole.editor,
              user: {
                id: 'userId2',
                __typename: 'User',
                firstName: 'Horace',
                lastName: 'Two',
                imageUrl: 'https://bit.ly/3rgHd6a',
                email: 'horace@email.com'
              }
            },
            {
              id: 'userJourneyId3',
              __typename: 'UserJourney',
              role: UserJourneyRole.inviteRequested,
              user: {
                id: 'userId3',
                __typename: 'User',
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
      query: USER_JOURNEY_APPROVE,
      variables: {
        id: 'userJourneyId3'
      }
    },
    result: {
      data: {
        userJourneyApprove: {
          id: 'userJourneyId3',
          __typename: 'UserJourney',
          role: UserJourneyRole.editor
        }
      }
    }
  },
  {
    request: {
      query: USER_JOURNEY_PROMOTE,
      variables: {
        id: 'userJourneyId2'
      }
    },
    result: {
      data: {
        userJourneyPromote: {
          id: 'userJourneyId2',
          __typename: 'UserJourney',
          role: UserJourneyRole.owner,
          journey: {
            id: 'journeyId',
            __typename: 'Journey',
            userJourneys: [
              {
                id: 'userJourneyId1',
                __typename: 'UserJourney',
                role: UserJourneyRole.editor
              },
              {
                id: 'userJourneyId2',
                __typename: 'UserJourney',
                role: UserJourneyRole.owner
              },
              {
                id: 'userJourneyId3',
                __typename: 'UserJourney',
                role: UserJourneyRole.inviteRequested
              }
            ]
          }
        }
      }
    }
  },
  {
    request: {
      query: USER_JOURNEY_REMOVE,
      variables: {
        id: 'userJourneyId2'
      }
    },
    result: {
      data: {
        userJourneyRemove: {
          id: 'userJourneyId2',
          __typename: 'UserJourney',
          role: UserJourneyRole.editor,
          journey: {
            id: 'journeyId',
            __typename: 'Journey'
          }
        }
      }
    }
  }
]

describe('AccessDialog', () => {
  const mockWithAuthUser = withAuthUser as jest.Mock
  const mockUseAuthUser = useAuthUser as jest.Mock

  beforeEach(() => {
    mockUseAuthUser.mockReturnValue(getMockAuthUser())
    mockWithAuthUser.mockImplementation(() => (wrappedComponent: ComponentType) => wrappedComponent)
  })

  it('allows invitee to be approved as editor', async () => {
    const cache = new InMemoryCache()
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider mocks={mocks} cache={cache}>
          <AccessDialog journeySlug="journeySlug" open={true} />
        </MockedProvider>
      </SnackbarProvider>
    )
    await waitFor(() =>
      expect(getByRole('button', { name: 'Manage' })).toBeInTheDocument()
    )
    fireEvent.click(getByRole('button', { name: 'Manage' }))
    fireEvent.click(getByRole('menuitem', { name: 'Approve' }))
    await waitFor(() =>
      expect(cache.extract()['UserJourney:userJourneyId3']?.role).toEqual(
        'editor'
      )
    )
  })

  it('allows editor to be removed', async () => {
    const cache = new InMemoryCache()
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider mocks={mocks} cache={cache}>
          <AccessDialog journeySlug="journeySlug" open={true} />
        </MockedProvider>
      </SnackbarProvider>
    )
    await waitFor(() =>
      expect(getByRole('button', { name: 'Editor' })).toBeInTheDocument()
    )
    fireEvent.click(getByRole('button', { name: 'Editor' }))
    fireEvent.click(getByRole('menuitem', { name: 'Remove' }))
    await waitFor(() =>
      expect(cache.extract()['Journey:journeyId']?.userJourneys).toEqual([
        { __ref: 'UserJourney:userJourneyId1' },
        { __ref: 'UserJourney:userJourneyId3' }
      ])
    )
  })

  it('allows editor to be promoted to owner', async () => {
    const cache = new InMemoryCache()
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider mocks={mocks} cache={cache}>
          <AccessDialog journeySlug="journeySlug" open={true} />
        </MockedProvider>
      </SnackbarProvider>
    )
    await waitFor(() =>
      expect(getByRole('button', { name: 'Editor' })).toBeInTheDocument()
    )
    fireEvent.click(getByRole('button', { name: 'Editor' }))
    fireEvent.click(getByRole('menuitem', { name: 'Promote' }))
    await waitFor(() =>
      expect(cache.extract()['UserJourney:userJourneyId2']?.role).toEqual(
        'owner'
      )
    )
    expect(cache.extract()['UserJourney:userJourneyId1']?.role).toEqual(
      'editor'
    )
  })

  it('calls on close', () => {
    const handleClose = jest.fn()
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider mocks={mocks}>
          <AccessDialog
            journeySlug="journeySlug"
            open={true}
            onClose={handleClose}
          />
        </MockedProvider>
      </SnackbarProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Close' }))
    expect(handleClose).toHaveBeenCalled()
  })

  describe('copy to clipboard', () => {
    const originalNavigator = { ...global.navigator }

    beforeEach(() => {
      Object.assign(navigator, {
        clipboard: {
          writeText: jest.fn()
        }
      })
    })

    afterEach(() => {
      jest.resetAllMocks()
      Object.assign(navigator, originalNavigator)
    })

    it('copies link to clipboard', async () => {
      const { getByRole, getByText } = render(
        <SnackbarProvider>
          <MockedProvider mocks={mocks}>
            <AccessDialog journeySlug="journeySlug" open={true} />
          </MockedProvider>
        </SnackbarProvider>
      )
      const link = 'http://localhost/journeys/journeySlug'
      expect(getByRole('textbox')).toHaveValue(link)
      fireEvent.click(getByRole('button', { name: 'Copy' }))
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(link)
      await waitFor(() =>
        expect(getByText('Editor invite link copied')).toBeInTheDocument()
      )
    })
  })
})