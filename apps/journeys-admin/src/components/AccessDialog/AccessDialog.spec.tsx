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

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('AccessDialog', () => {
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

  it('should enable role edit if current user is the journey owner', async () => {
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
                    id: 'userId1',
                    __typename: 'User',
                    email: 'amin@email.com'
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
      expect(getByRole('button', { name: 'Editor' })).not.toBeDisabled()
    )
  })

  it('opens email invite form on click', async () => {
    const { getByRole, queryByRole } = render(
      <SnackbarProvider>
        <MockedProvider>
          <AccessDialog journeyId="journeyId" open onClose={noop} />
        </MockedProvider>
      </SnackbarProvider>
    )

    const button = getByRole('button', { name: 'Email' })
    expect(queryByRole('button', { name: 'Copy' })).not.toBeInTheDocument()

    fireEvent.click(button)
    fireEvent.click(getByRole('menuitem', { name: 'Link' }))

    expect(queryByRole('button', { name: 'Copy' })).toBeInTheDocument()

    fireEvent.click(button)
    fireEvent.click(getByRole('menuitem', { name: 'Email' }))
    await waitFor(() =>
      expect(queryByRole('button', { name: 'Copy' })).not.toBeInTheDocument()
    )
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
          <MockedProvider>
            <AccessDialog journeyId="journeyId" open onClose={noop} />
          </MockedProvider>
        </SnackbarProvider>
      )
      const button = getByRole('button', { name: 'Email' })
      fireEvent.click(button)
      fireEvent.click(getByRole('menuitem', { name: 'Link' }))
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
