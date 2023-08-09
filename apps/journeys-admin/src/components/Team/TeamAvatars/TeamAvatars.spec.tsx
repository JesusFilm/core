import { fireEvent, render, waitFor } from '@testing-library/react'

import { GetLastActiveTeamIdAndTeams_teams_userTeams as UserTeams } from '../../../../__generated__/GetLastActiveTeamIdAndTeams'

import { TeamAvatars } from './TeamAvatars'

describe('TeamAvatars', () => {
  const userTeam: UserTeams[] = [
    {
      __typename: 'UserTeam',
      id: 'userTeamId1',
      user: {
        __typename: 'User',
        id: 'userId',
        firstName: 'Joe',
        lastName: 'Bloggs',
        imageUrl: 'image'
      }
    },
    {
      __typename: 'UserTeam',
      id: 'userTeamId1',
      user: {
        __typename: 'User',
        id: 'userId',
        firstName: 'Mike',
        lastName: 'The Guy',
        imageUrl: 'image'
      }
    },
    {
      __typename: 'UserTeam',
      id: 'userTeamId1',
      user: {
        __typename: 'User',
        id: 'userId',
        firstName: 'Bob',
        lastName: 'The Builder',
        imageUrl: 'image'
      }
    }
  ]

  const userTeamOverflow: UserTeams[] = [
    {
      __typename: 'UserTeam',
      id: 'userTeamId1',
      user: {
        __typename: 'User',
        id: 'userId',
        firstName: 'Joe',
        lastName: 'Bloggs',
        imageUrl: 'image'
      }
    },
    {
      __typename: 'UserTeam',
      id: 'userTeamId1',
      user: {
        __typename: 'User',
        id: 'userId',
        firstName: 'Mike',
        lastName: 'The Guy',
        imageUrl: 'image'
      }
    },
    {
      __typename: 'UserTeam',
      id: 'userTeamId1',
      user: {
        __typename: 'User',
        id: 'userId',
        firstName: 'Bob',
        lastName: 'The Builder',
        imageUrl: 'image'
      }
    },
    {
      __typename: 'UserTeam',
      id: 'userTeamId1',
      user: {
        __typename: 'User',
        id: 'userId',
        firstName: 'Hello',
        lastName: 'Kitty',
        imageUrl: 'image'
      }
    },
    {
      __typename: 'UserTeam',
      id: 'userTeamId1',
      user: {
        __typename: 'User',
        id: 'userId',
        firstName: 'Serena',
        lastName: 'Williams',
        imageUrl: 'image'
      }
    },
    {
      __typename: 'UserTeam',
      id: 'userTeamId1',
      user: {
        __typename: 'User',
        id: 'userId',
        firstName: 'Jonathan',
        lastName: 'G',
        imageUrl: 'image'
      }
    },
    {
      __typename: 'UserTeam',
      id: 'userTeamId1',
      user: {
        __typename: 'User',
        id: 'userId',
        firstName: 'Meme',
        lastName: 'Guy',
        imageUrl: 'image'
      }
    }
  ]

  beforeAll(() => {
    jest.clearAllMocks()
  })

  it('should show add button when onclick handler passed in', () => {
    const handleOpen = jest.fn()
    const { getByTestId } = render(
      <TeamAvatars userTeams={userTeam} size="large" onClick={handleOpen} />
    )
    fireEvent.click(getByTestId('member-dialog-open-avatar'))
    expect(handleOpen).toHaveBeenCalled()
  })

  it('does not display add button if there is no onclick handler', () => {
    const { queryByTestId } = render(
      <TeamAvatars userTeams={userTeam} size="large" />
    )

    expect(queryByTestId('member-dialog-open-avatar')).not.toBeInTheDocument()
  })

  it('display no more than 4 avatars', async () => {
    const handleOpen = jest.fn()
    const { getByText, getAllByTestId } = render(
      <TeamAvatars
        userTeams={userTeamOverflow}
        size="large"
        onClick={() => handleOpen}
      />
    )

    await waitFor(() => expect(userTeamOverflow).toHaveLength(7))
    const renderedAvatars = await getAllByTestId('avatar')
    expect(renderedAvatars).toHaveLength(4)
    expect(getByText('+3')).toBeInTheDocument()
  })
})
