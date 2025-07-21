import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/nextjs'
import { fn } from 'storybook/test'
import { ComponentProps } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { JourneyFields as Journey } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { GetAllTeamHosts_hosts as Host } from '../../../../../../../../../__generated__/GetAllTeamHosts'
import {
  GetUserTeamsAndInvites,
  GetUserTeamsAndInvites_userTeams as UserTeam
} from '../../../../../../../../../__generated__/GetUserTeamsAndInvites'
import { UserTeamRole } from '../../../../../../../../../__generated__/globalTypes'
import { ThemeProvider } from '../../../../../../../ThemeProvider'
import { DRAWER_WIDTH } from '../../../../../../constants'

import { HostSelection } from './HostSelection'

const Demo: Meta<typeof HostSelection> = {
  ...simpleComponentConfig,
  component: HostSelection,
  title:
    'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/JourneyAppearance/Host/HostSelection'
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

const defaultHost: Host = {
  id: 'hostId',
  __typename: 'Host' as const,
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

const data: GetUserTeamsAndInvites = {
  userTeams: [userTeam],
  userTeamInvites: []
}

const handleSelection = fn()

const Template: StoryObj<{
  journey: Journey
  componentProps: ComponentProps<typeof HostSelection>
}> = {
  render: ({ journey, componentProps }) => {
    return (
      <MockedProvider>
        <ThemeProvider>
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            <Box sx={{ width: DRAWER_WIDTH }}>
              <HostSelection {...componentProps} />
            </Box>
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )
  }
}

export const Default = {
  ...Template,
  args: {
    journey: { ...journey, host: null },
    componentProps: {
      userInTeam: true,
      data,
      handleSelection
    }
  }
}

export const EditHost = {
  ...Template,
  args: {
    journey,
    componentProps: {
      userInTeam: true,
      data,
      handleSelection
    }
  }
}

export const Disabled = {
  ...Template,
  args: {
    journey: { ...journey, host: null },
    componentProps: {
      userInTeam: false,
      data,
      handleSelection
    }
  }
}

export default Demo
