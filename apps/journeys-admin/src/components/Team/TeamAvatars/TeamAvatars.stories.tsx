import Stack from '@mui/material/Stack'
import { Meta, StoryObj } from '@storybook/nextjs'

import { GetLastActiveTeamIdAndTeams_teams_userTeams as UserTeams } from '@core/journeys/ui/TeamProvider/__generated__/GetLastActiveTeamIdAndTeams'
import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { UserTeamRole } from '../../../../__generated__/globalTypes'

import { TeamAvatars } from './TeamAvatars'

const TeamAvatarsStory: Meta<typeof TeamAvatars> = {
  ...journeysAdminConfig,
  component: TeamAvatars,
  title: 'Journeys-Admin/Team/TeamAvatars'
}

const userTeam: UserTeams[] = [
  {
    __typename: 'UserTeam',
    id: 'userTeamId1',
    user: {
      __typename: 'User',
      id: 'userId',
      firstName: 'Joe',
      lastName: 'Bloggs',
      imageUrl: 'image',
      email: 'email@example.com'
    },
    role: UserTeamRole.member
  },
  {
    __typename: 'UserTeam',
    id: 'userTeamId1',
    user: {
      __typename: 'User',
      id: 'userId',
      firstName: 'Mike',
      lastName: 'The Guy',
      imageUrl: 'image',
      email: 'email1@example.com'
    },
    role: UserTeamRole.member
  },
  {
    __typename: 'UserTeam',
    id: 'userTeamId1',
    user: {
      __typename: 'User',
      id: 'userId',
      firstName: 'Bob',
      lastName: 'The Builder',
      imageUrl: 'image',
      email: 'email1@example.com'
    },
    role: UserTeamRole.member
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
      imageUrl: 'image',
      email: 'email1@example.com'
    },
    role: UserTeamRole.member
  },
  {
    __typename: 'UserTeam',
    id: 'userTeamId1',
    user: {
      __typename: 'User',
      id: 'userId',
      firstName: 'Mike',
      lastName: 'The Guy',
      imageUrl: 'image',
      email: 'email1@example.com'
    },
    role: UserTeamRole.member
  },
  {
    __typename: 'UserTeam',
    id: 'userTeamId1',
    user: {
      __typename: 'User',
      id: 'userId',
      firstName: 'Bob',
      lastName: 'The Builder',
      imageUrl: 'image',
      email: 'email1@example.com'
    },
    role: UserTeamRole.member
  },
  {
    __typename: 'UserTeam',
    id: 'userTeamId1',
    user: {
      __typename: 'User',
      id: 'userId',
      firstName: 'Hello',
      lastName: 'Kitty',
      imageUrl: 'image',
      email: 'email1@example.com'
    },
    role: UserTeamRole.member
  },
  {
    __typename: 'UserTeam',
    id: 'userTeamId1',
    user: {
      __typename: 'User',
      id: 'userId',
      firstName: 'Serena',
      lastName: 'Williams',
      imageUrl: 'image',
      email: 'email1@example.com'
    },
    role: UserTeamRole.member
  },
  {
    __typename: 'UserTeam',
    id: 'userTeamId1',
    user: {
      __typename: 'User',
      id: 'userId',
      firstName: 'Jonathan',
      lastName: 'G',
      imageUrl: 'image',
      email: 'email1@example.com'
    },
    role: UserTeamRole.member
  }
]

const Template: StoryObj<typeof TeamAvatars> = {
  render: ({ userTeams, onClick, size }) => {
    return (
      <Stack direction="row">
        <TeamAvatars userTeams={userTeams} onClick={onClick} size={size} />
      </Stack>
    )
  }
}
export const Default = {
  ...Template,
  args: {
    userTeams: userTeam
  }
}

export const Large = {
  ...Template,
  args: {
    userTeams: userTeam,
    size: 'large'
  }
}

export const OverFlow = {
  ...Template,
  args: {
    userTeams: userTeamOverflow,
    size: 'large'
  }
}

export const WithAdd = {
  ...Template,
  args: {
    userTeams: userTeamOverflow,
    size: 'large',
    onClick: () => undefined
  }
}

export default TeamAvatarsStory
