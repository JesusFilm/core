import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { jest } from '@storybook/jest'
import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { JourneyFields as Journey } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'

import {
  GetUserTeamsAndInvites,
  GetUserTeamsAndInvites_userTeams as UserTeam
} from '../../../../../../../../../__generated__/GetUserTeamsAndInvites'
import { UserTeamRole } from '../../../../../../../../../__generated__/globalTypes'
import { simpleComponentConfig } from '../../../../../../../../libs/storybook'
import { ThemeProvider } from '../../../../../../../ThemeProvider'
import { DRAWER_WIDTH } from '../../../../../../constants'

import { HostSelection } from './HostSelection'

const Demo: Meta<typeof HostSelection> = {
  ...simpleComponentConfig,
  component: HostSelection,
  title:
    'Journeys-Admin/Editor/ControlPanel/Attributes/Footer/HostTab/HostSelection'
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

const data: GetUserTeamsAndInvites = {
  userTeams: [userTeam],
  userTeamInvites: []
}

const handleSelection = jest.fn()

const Template: StoryObj<
  ComponentProps<typeof HostSelection> & {
    journey: Journey
    userInTeam: boolean
  }
> = {
  render: ({ journey, userInTeam }) => {
    return (
      <MockedProvider>
        <ThemeProvider>
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            <Box sx={{ width: DRAWER_WIDTH }}>
              <HostSelection
                data={data}
                userInTeam={userInTeam}
                handleSelection={handleSelection}
              />
            </Box>
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )
  }
}

export const EditHost = {
  ...Template,
  args: {
    journey,
    userInTeam: true
  }
}

export const Disabled = {
  ...Template,
  args: {
    journey: { ...journey, host: null },
    userInTeam: false
  }
}

export default Demo
