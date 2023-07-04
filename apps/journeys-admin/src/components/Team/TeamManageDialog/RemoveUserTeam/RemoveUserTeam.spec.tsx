import { render, fireEvent, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { InMemoryCache } from '@apollo/client'
import {
  RemoveUserTeam,
  USER_TEAM_INVITE_REMOVE,
  USER_TEAM_DELETE
} from './RemoveUserTeam'

describe('RemoveUserTeam', () => {
  const result = jest.fn(() => ({
    data: {
      userTeamDelete: {
        id: 'userTeamId'
      }
    }
  }))

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
        query: USER_TEAM_DELETE,
        variables: { id: 'userTeamId' }
      },
      result
    },
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
      'UserTeam:userTeamId': {
        __typename: 'UserTeam',
        id: 'userTeamId'
      },
      'UserTeamInvite:userTeamInviteId': {
        __typename: 'UserTeamInvite',
        id: 'userTeamInviteId'
      }
    })
  })
  it('it should remove a team member', async () => {
    const handleClick = jest.fn()
    const { getByText } = render(
      <MockedProvider mocks={mocks} cache={cache}>
        <RemoveUserTeam
          id="userTeamId"
          isInvite={false}
          onClick={handleClick}
        />
      </MockedProvider>
    )
    fireEvent.click(getByText('Remove'))
    await waitFor(() => {
      expect(result).toHaveBeenCalled()
    })
    expect(cache.extract()['UserTeam:userTeamId']).toBeUndefined()
  })

  it('it should remove a team invite', async () => {
    const handleClick = jest.fn()
    const { getByText } = render(
      <MockedProvider mocks={mocks} cache={cache}>
        <RemoveUserTeam id="userTeamInviteId" isInvite onClick={handleClick} />
      </MockedProvider>
    )
    fireEvent.click(getByText('Remove'))
    await waitFor(() => {
      expect(inviteResult).toHaveBeenCalled()
    })
    expect(cache.extract()['UserTeamInvite:userTeamInviteId']).toBeUndefined()
  })
})
