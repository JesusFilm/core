import { render, fireEvent, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { InMemoryCache } from '@apollo/client'
import {
  UserTeamInviteRemoveMenuItem,
  USER_TEAM_INVITE_REMOVE
} from './UserTeamInviteRemoveMenuItem'

describe('UserTeamInviteRemoveMenuItem', () => {
  const inviteResult = jest.fn(() => ({
    data: {
      userTeamInviteRemove: {
        id: 'userTeamInviteId'
      }
    }
  }))

  const mocks = [
    {
      request: {
        query: USER_TEAM_INVITE_REMOVE,
        variables: { id: 'userTeamInviteId' }
      },
      result: inviteResult
    }
  ]

  let cache: InMemoryCache

  beforeEach(() => {
    cache = new InMemoryCache()
    cache.restore({
      'UserTeamInvite:userTeamInviteId': {
        __typename: 'UserTeamInvite',
        id: 'userTeamInviteId'
      }
    })
  })

  it('it should remove a team invite', async () => {
    const handleClick = jest.fn()
    const { getByText } = render(
      <MockedProvider mocks={mocks} cache={cache}>
        <UserTeamInviteRemoveMenuItem
          id="userTeamInviteId"
          onClick={handleClick}
        />
      </MockedProvider>
    )
    fireEvent.click(getByText('Remove'))
    await waitFor(() => {
      expect(inviteResult).toHaveBeenCalled()
    })
    expect(cache.extract()['UserTeamInvite:userTeamInviteId']).toBeUndefined()
  })
})
