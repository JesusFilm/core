import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import {
  USER_TEAM_DELETE,
  UserTeamDeleteMenuItem
} from './UserTeamDeleteMenuItem'

describe('UserTeamDeleteMenuItem', () => {
  const result = jest.fn(() => ({
    data: {
      userTeamDelete: {
        id: 'userTeamId'
      }
    }
  }))

  const mocks = [
    {
      request: {
        query: USER_TEAM_DELETE,
        variables: { id: 'userTeamId' }
      },
      result
    }
  ]
  let cache: InMemoryCache

  beforeEach(() => {
    cache = new InMemoryCache()
    cache.restore({
      'UserTeam:userTeamId': {
        __typename: 'UserTeam',
        id: 'userTeamId'
      }
    })
  })

  it('should remove a team member', async () => {
    const handleClick = jest.fn()
    const { getByText } = render(
      <MockedProvider mocks={mocks} cache={cache}>
        <UserTeamDeleteMenuItem id="userTeamId" onClick={handleClick} />
      </MockedProvider>
    )
    fireEvent.click(getByText('Remove'))
    await waitFor(() => {
      expect(result).toHaveBeenCalled()
    })
    expect(cache.extract()['UserTeam:userTeamId']).toBeUndefined()
  })
})
