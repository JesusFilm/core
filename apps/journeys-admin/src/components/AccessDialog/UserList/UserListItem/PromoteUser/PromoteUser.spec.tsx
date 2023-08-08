import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { UserJourneyRole } from '../../../../../../__generated__/globalTypes'

import { USER_JOURNEY_PROMOTE } from './PromoteUser'

import { PromoteUser } from '.'

describe('PromoteUser', () => {
  it('should promote user journey', async () => {
    const handleClick = jest.fn()
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
        addTypename={false}
        mocks={[
          {
            request: {
              query: USER_JOURNEY_PROMOTE,
              variables: {
                id: 'userId'
              }
            },
            result
          }
        ]}
      >
        <PromoteUser id="userId" onClick={handleClick} />
      </MockedProvider>
    )
    fireEvent.click(getByRole('menuitem'))
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(handleClick).toHaveBeenCalled()
  })
})
