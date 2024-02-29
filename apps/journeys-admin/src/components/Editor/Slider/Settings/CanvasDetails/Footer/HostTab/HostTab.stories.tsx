import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { expect } from '@storybook/jest'
import { Meta, StoryObj } from '@storybook/react'
import { screen, userEvent, waitFor } from '@storybook/testing-library'
import { ComponentProps } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { JourneyFields as Journey } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'

import { UserTeamRole } from '../../../../../../../../__generated__/globalTypes'
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

const defaultHost = {
  id: 'hostId',
  __typename: 'Host' as const,
  teamId: 'teamId',
  title: 'Cru International',
  location: null,
  src1: null,
  src2: null
}

const journey = {
  __typename: 'Journey',
  id: 'journeyId',
  seoTitle: 'My awesome journey',
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
  },
  team: { __typename: 'Team', id: 'teamId', title: 'My Team' },
  host: defaultHost
} as unknown as Journey

const user = {
  id: 'userId',
  email: 'admin@email.com'
}

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
const userTeamMock = {
  request: {
    query: GET_USER_TEAMS_AND_INVITES,
    variables: {
      teamId: 'teamId',
      where: { role: [UserTeamRole.manager, UserTeamRole.member] }
    }
  },
  result: {
    data: {
      userTeams: [
        {
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
      ],
      userTeamInvites: []
    }
  }
}
const teamHostsMock = {
  request: {
    query: GET_ALL_TEAM_HOSTS,
    variables: { teamId: journey?.team?.id }
  },
  result: {
    data: {
      hosts: [
        {
          id: '1',
          location: '',
          src1: null,
          src2: null,
          title: `John "The Rock" Geronimo`
        },
        {
          id: '2',
          location: 'Auckland, New Zealand',
          src1: null,
          src2: null,
          title: 'Jian Wei'
        },
        {
          id: '3',
          location: 'Auckland, New Zealand',
          src1: null,
          src2: 'https://tinyurl.com/4b3327yn',
          title: 'Nisal Cottingham'
        },
        {
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

const journeyHostMock = {
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
        id: journey.id,
        host: {
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
    mocks: [userMock, userTeamMock, teamHostsMock],
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

export const HostFormTab = {
  ...Template,
  args: {
    mocks: [...Default.args.mocks, journeyHostMock],
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
