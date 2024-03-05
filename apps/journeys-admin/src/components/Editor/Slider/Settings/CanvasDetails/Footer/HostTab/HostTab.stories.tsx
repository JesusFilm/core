import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { expect } from '@storybook/jest'
import { Meta, StoryObj } from '@storybook/react'
import { screen, userEvent, waitFor } from '@storybook/testing-library'
import { ComponentProps } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { JourneyFields as Journey } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'

import {
  GetAllTeamHosts,
  GetAllTeamHostsVariables
} from '../../../../../../../../__generated__/GetAllTeamHosts'
import {
  GetUserTeamsAndInvites,
  GetUserTeamsAndInvites_userTeams as UserTeam
} from '../../../../../../../../__generated__/GetUserTeamsAndInvites'
import { UserTeamRole } from '../../../../../../../../__generated__/globalTypes'
import {
  UpdateJourneyHost,
  UpdateJourneyHostVariables
} from '../../../../../../../../__generated__/UpdateJourneyHost'
import { journeysAdminConfig } from '../../../../../../../libs/storybook'
import { GET_CURRENT_USER } from '../../../../../../../libs/useCurrentUserLazyQuery'
import { UPDATE_JOURNEY_HOST } from '../../../../../../../libs/useUpdateJourneyHostMutation/useUpdateJourneyHostMutation'
import { GET_USER_TEAMS_AND_INVITES } from '../../../../../../../libs/useUserTeamsAndInvitesQuery/useUserTeamsAndInvitesQuery'
import { ThemeProvider } from '../../../../../../ThemeProvider'
import { DRAWER_WIDTH } from '../../../../../constants'

import { GET_ALL_TEAM_HOSTS, HostTab } from './HostTab'

const Demo: Meta<typeof HostTab> = {
  ...journeysAdminConfig,
  component: HostTab,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Footer/HostTab'
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
        __typename: 'Translation'
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

const updateJourneyHostMock: MockedResponse<
  UpdateJourneyHost,
  UpdateJourneyHostVariables
> = {
  request: {
    query: UPDATE_JOURNEY_HOST,
    variables: {
      id: journey.id,
      input: {
        hostId: null
      }
    }
  },
  result: {
    data: {
      journeyUpdate: {
        __typename: 'Journey',
        id: journey.id,
        host: {
          __typename: 'Host',
          id: defaultHost.id
        }
      }
    }
  }
}

const Template: StoryObj<
  ComponentProps<typeof HostTab> & { mocks: MockedResponse[] }
> = {
  render: ({ mocks, ...args }) => (
    <MockedProvider mocks={mocks}>
      <ThemeProvider>
        <JourneyProvider value={{ ...args, variant: 'admin' }}>
          <Box sx={{ width: DRAWER_WIDTH }}>
            <HostTab />
          </Box>
        </JourneyProvider>
      </ThemeProvider>
    </MockedProvider>
  )
}

// Default HostTabs based on host availability
export const Default = {
  ...Template,
  args: {
    mocks: [userMock, getUserTeamMock, getTeamHostsMock],
    journey: { ...journey, host: null }
  }
}

export const Disabled = {
  ...Template,
  args: {
    mocks: [],
    journey: { ...journey, host: null }
  }
}

export const EditHost = {
  ...Template,
  args: {
    ...Default.args,
    journey
  }
}

export const HostListTab = {
  ...Template,
  args: {
    ...Default.args,
    journey: { ...journey, host: null }
  },
  play: async () => {
    await waitFor(async () => {
      await expect(
        screen.getByRole('button', { name: 'Select a Host' })
      ).not.toBeDisabled()
    })
    await userEvent.click(screen.getByRole('button', { name: 'Select a Host' }))
    await waitFor(async () => {
      await expect(screen.getByText('Hosts')).toBeInTheDocument()
    })
  }
}

export const HostFormTabEmpty = {
  ...Template,
  args: {
    mocks: [...Default.args.mocks, updateJourneyHostMock],
    journey: { ...journey, host: null }
  },
  play: async () => {
    await waitFor(async () => {
      await expect(
        screen.getByRole('button', { name: 'Select a Host' })
      ).not.toBeDisabled()
    })
    await userEvent.click(screen.getByRole('button', { name: 'Select a Host' }))
    await waitFor(async () => {
      await expect(
        screen.getByRole('button', { name: 'Create New' })
      ).toBeInTheDocument()
    })
    await userEvent.click(screen.getByRole('button', { name: 'Create New' }))
    await waitFor(async () => {
      await expect(screen.getByText('Host Name')).toBeInTheDocument()
    })
  }
}

export const HostFormTabFilled = {
  ...Template,
  args: {
    mocks: [...Default.args.mocks, updateJourneyHostMock],
    journey
  },
  play: async () => {
    await waitFor(async () => {
      await expect(
        screen.getByRole('button', { name: 'Cru International Florida, USA' })
      ).not.toBeDisabled()
    })
    await userEvent.click(
      screen.getByRole('button', { name: 'Cru International Florida, USA' })
    )
    await waitFor(async () => {
      await expect(screen.getByText('Host Name')).toBeInTheDocument()
      await expect(
        screen.getByRole('button', { name: 'Clear' })
      ).toBeInTheDocument()
    })
  }
}

export const HostInfoTab = {
  ...Template,
  args: {
    ...Default.args,
    journey: { ...journey, host: null }
  },
  play: async () => {
    await waitFor(async () => {
      await expect(
        screen.getByRole('button', { name: 'Select a Host' })
      ).not.toBeDisabled()
    })
    await userEvent.click(screen.getByRole('button', { name: 'Select a Host' }))
    await waitFor(async () => {
      await expect(screen.getAllByTestId('info')[0]).toBeInTheDocument()
    })
    await userEvent.click(screen.getAllByTestId('info')[0])
    await waitFor(async () => {
      await expect(
        screen.getByText('Why does your journey need a host?')
      ).toBeInTheDocument()
    })
  }
}

export default Demo
