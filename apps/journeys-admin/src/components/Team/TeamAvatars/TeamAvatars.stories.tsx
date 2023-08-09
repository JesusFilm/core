import Stack from '@mui/material/Stack'
import { Meta, Story } from '@storybook/react'
import { ComponentProps } from 'react'

import { GetLastActiveTeamIdAndTeams_teams_userTeams as UserTeams } from '../../../../__generated__/GetLastActiveTeamIdAndTeams'
import { journeysAdminConfig } from '../../../libs/storybook'

import { TeamAvatars } from './TeamAvatars'

const TeamAvatarsStory = {
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
  }
]

const Template: Story<ComponentProps<typeof TeamAvatars>> = ({
  userTeams,
  onClick,
  size
}) => {
  return (
    <Stack direction="row">
      <TeamAvatars userTeams={userTeams} onClick={onClick} size={size} />
    </Stack>
  )
}

export const Default = Template.bind({})
Default.args = {
  userTeams: userTeam
}

export const Large = Template.bind({})
Large.args = {
  userTeams: userTeam,
  size: 'large'
}

export const OverFlow = Template.bind({})
OverFlow.args = {
  userTeams: userTeamOverflow,
  size: 'large'
}

export const WithAdd = Template.bind({})
WithAdd.args = {
  userTeams: userTeamOverflow,
  size: 'large',
  onClick: () => undefined
}

export default TeamAvatarsStory as Meta
