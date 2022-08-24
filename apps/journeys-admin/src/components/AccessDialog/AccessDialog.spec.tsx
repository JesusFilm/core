import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { noop } from 'lodash'
import { SnackbarProvider } from 'notistack'
import { UserJourneyRole } from '../../../__generated__/globalTypes'
import {
  AccessDialog,
  GET_CURRENT_USER,
  GET_JOURNEY_WITH_USER_JOURNEYS
} from './AccessDialog'
import { USER_JOURNEY_APPROVE } from './ApproveUser/ApproveUser'
import { USER_JOURNEY_PROMOTE } from './PromoteUser/PromoteUser'
import { USER_JOURNEY_REMOVE } from './RemoveUser/RemoveUser'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
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
  },
  {
    request: {
      query: GET_CURRENT_USER
    },
    result: {
      data: {
        me: {
          id: 'userId1',
          __typename: 'User',
          email: 'amin@email.com'
        }
      }
    }
  }
]

describe('AccessDialog', () => {
  it('allows invitee to be approved as editor', async () => {
    const cache = new InMemoryCache()
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider mocks={mocks} cache={cache}>
          <AccessDialog journeyId="journeyId" open onClose={noop} />
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
          <AccessDialog journeyId="journeyId" open onClose={noop} />
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
          <AccessDialog journeyId="journeyId" open onClose={noop} />
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

  it('does not allow owners to edit their own access', async () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider mocks={mocks}>
          <AccessDialog journeyId="journeyId" open onClose={noop} />
        </MockedProvider>
      </SnackbarProvider>
    )
    await waitFor(() =>
      expect(getByRole('button', { name: 'Owner' })).toBeDisabled()
    )
  })

  it('does not allow editors to edit access', async () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider
          mocks={[
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
                query: GET_CURRENT_USER
              },
              result: {
                data: {
                  me: {
                    id: 'userId2',
                    __typename: 'User',
                    email: 'horace@email.com'
                  }
                }
              }
            }
          ]}
        >
          <AccessDialog journeyId="journeyId" open onClose={noop} />
        </MockedProvider>
      </SnackbarProvider>
    )
    await waitFor(() =>
      expect(getByRole('button', { name: 'Manage' })).toBeDisabled()
    )
    expect(getByRole('button', { name: 'Editor' })).toBeDisabled()
    expect(getByRole('button', { name: 'Owner' })).toBeDisabled()
  })

  it('calls on close', () => {
    const handleClose = jest.fn()
    const { getByTestId } = render(
      <SnackbarProvider>
        <MockedProvider mocks={mocks}>
          <AccessDialog journeyId="journeyId" open onClose={handleClose} />
        </MockedProvider>
      </SnackbarProvider>
    )
    fireEvent.click(getByTestId('dialog-close-button'))
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
            <AccessDialog journeyId="journeyId" open onClose={noop} />
          </MockedProvider>
        </SnackbarProvider>
      )
      const link = 'http://localhost/journeys/journeyId'
      expect(getByRole('textbox')).toHaveValue(link)
      fireEvent.click(getByRole('button', { name: 'Copy' }))
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(link)
      await waitFor(() =>
        expect(getByText('Editor invite link copied')).toBeInTheDocument()
      )
    })
  })
})
