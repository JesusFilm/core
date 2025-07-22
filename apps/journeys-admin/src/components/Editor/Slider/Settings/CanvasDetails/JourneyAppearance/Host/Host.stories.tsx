import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/nextjs'
import { ComponentProps } from 'react'
import { screen, userEvent } from 'storybook/test'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { JourneyFields as Journey } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'
import { journeysAdminConfig } from '@core/shared/ui/storybook'

import {
  GetAllTeamHosts,
  GetAllTeamHostsVariables
} from '../../../../../../../../__generated__/GetAllTeamHosts'
import {
  GetUserTeamsAndInvites,
  GetUserTeamsAndInvites_userTeams as UserTeam
} from '../../../../../../../../__generated__/GetUserTeamsAndInvites'
import { UserTeamRole } from '../../../../../../../../__generated__/globalTypes'
import { GET_CURRENT_USER } from '../../../../../../../libs/useCurrentUserLazyQuery'
import { GET_USER_TEAMS_AND_INVITES } from '../../../../../../../libs/useUserTeamsAndInvitesQuery/useUserTeamsAndInvitesQuery'
import { ThemeProvider } from '../../../../../../ThemeProvider'
import { DRAWER_WIDTH } from '../../../../../constants'

import { GET_ALL_TEAM_HOSTS, Host } from './Host'

const Demo: Meta<typeof Host> = {
  ...journeysAdminConfig,
  component: Host,
  title:
    'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/JourneyAppearance/Host'
}

const user = {
  id: 'userId',
  email: 'admin@email.com'
}

const userTeam: UserTeam = {
  id: 'teamId',
  __typename: 'UserTeam',
  role: UserTeamRole.manager,
  user: {
    __typename: 'User',
    email: user.email,
    firstName: 'User',
    id: user.id,
    imageUrl: 'imageURL',
    lastName: '1'
  }
}

const defaultHost = {
  id: 'hostId',
  __typename: 'Host' as const,
  teamId: 'teamId',
  title: 'Cru International',
  location: 'Florida, USA',
  src1: 'https://tinyurl.com/3bxusmyb',
  src2: null
}

const journey = {
  __typename: 'Journey',
  id: 'journeyId',
  seoTitle: 'My awesome journey',
  host: defaultHost,
  team: { id: userTeam.id, title: 'My team' },
  language: {
    __typename: 'Language',
    id: '529',
    name: [
      {
        value: 'English',
        primary: true,
        __typename: 'LanguageName'
      }
    ]
  }
} as unknown as Journey

const userMock = {
  request: {
    query: GET_CURRENT_USER
  },
  result: {
    data: {
      me: user
    }
  }
}
const getUserTeamMock: MockedResponse<GetUserTeamsAndInvites> = {
  request: {
    query: GET_USER_TEAMS_AND_INVITES,
    variables: {
      teamId: userTeam.id,
      where: { role: [UserTeamRole.manager, UserTeamRole.member] }
    }
  },
  result: {
    data: {
      userTeams: [userTeam],
      userTeamInvites: []
    }
  }
}
const getTeamHostsMock: MockedResponse<
  GetAllTeamHosts,
  GetAllTeamHostsVariables
> = {
  request: {
    query: GET_ALL_TEAM_HOSTS,
    variables: { teamId: journey?.team?.id ?? '' }
  },
  result: {
    data: {
      hosts: [
        {
          __typename: 'Host',
          id: '1',
          location: '',
          src1: null,
          src2: null,
          title: `John "The Rock" Geronimo`
        },
        {
          __typename: 'Host',
          id: '2',
          location: 'Auckland, New Zealand',
          src1: null,
          src2: null,
          title: 'Jian Wei'
        },
        {
          __typename: 'Host',
          id: '3',
          location: 'Auckland, New Zealand',
          src1: null,
          src2: 'https://tinyurl.com/4b3327yn',
          title: 'Nisal Cottingham'
        },
        {
          __typename: 'Host',
          id: '4',
          location: 'Tokyo, Japan',
          src1: 'https://tinyurl.com/3bxusmyb',
          src2: 'https://tinyurl.com/mr4a78kb',
          title: 'John G & Siyang C'
        }
      ]
    }
  }
}

const Template: StoryObj<
  ComponentProps<typeof Host> & { mocks: MockedResponse[] }
> = {
  render: ({ mocks, ...args }) => (
    <MockedProvider mocks={mocks}>
      <ThemeProvider>
        <JourneyProvider value={{ ...args, variant: 'admin' }}>
          <EditorProvider>
            <Box sx={{ width: DRAWER_WIDTH }}>
              <Host />
            </Box>
          </EditorProvider>
        </JourneyProvider>
      </ThemeProvider>
    </MockedProvider>
  )
}

// Default Hosts based on host availability
export const Default = {
  ...Template,
  args: {
    mocks: [userMock, getUserTeamMock, getTeamHostsMock],
    journey: { ...journey, host: null }
  }
}

export const Open = {
  ...Template,
  args: {
    mocks: [userMock, getUserTeamMock, getTeamHostsMock],
    journey: { ...journey, host: null }
  },
  play: async () => {
    await userEvent.click(screen.getByRole('button', { name: 'Hosted By' }))
  }
}

export default Demo
