import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { UserJourneyRole } from '../../../../__generated__/globalTypes'
import { RemoveUser, USER_JOURNEY_REMOVE } from './RemoveUser'

describe('RemoveUser', () => {
  it('should remove user journey', async () => {
    const result = jest.fn(() => ({
      data: {
        userJourneyPromote: {
          id: 'userId',
          role: UserJourneyRole.editor,
          journey: {
            id: 'journeyId',
            userJourneys: []
          }
        }
      }
    }))
    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: USER_JOURNEY_REMOVE,
              variables: {
                id: 'userId'
              }
            },
            result
          }
        ]}
      >
        <RemoveUser id="userId" />
      </MockedProvider>
    )
    fireEvent.click(getByRole('menuitem'))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })
})
