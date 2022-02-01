import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { UserJourneyRole } from '../../../../__generated__/globalTypes'
import { USER_JOURNEY_APPROVE } from './ApproveUser'
import { ApproveUser } from '.'

describe('ApproveUser', () => {
  it('should approve user journey', async () => {
    const handleClick = jest.fn()
    const result = jest.fn(() => ({
      data: {
        userJourneyApprove: {
          id: 'userId',
          role: UserJourneyRole.editor
        }
      }
    }))
    const { getByRole } = render(
      <MockedProvider
        addTypename={false}
        mocks={[
          {
            request: {
              query: USER_JOURNEY_APPROVE,
              variables: {
                id: 'userId'
              }
            },
            result
          }
        ]}
      >
        <ApproveUser id="userId" onClick={handleClick} />
      </MockedProvider>
    )
    fireEvent.click(getByRole('menuitem'))
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(handleClick).toHaveBeenCalled()
  })
})
