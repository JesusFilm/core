import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { jest } from '@storybook/jest'
import { Meta, StoryObj } from '@storybook/react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { GetAllTeamHosts } from '../../../../../../../../../__generated__/GetAllTeamHosts'
import { simpleComponentConfig } from '../../../../../../../../libs/storybook'
import { ThemeProvider } from '../../../../../../../ThemeProvider'
import { DRAWER_WIDTH } from '../../../../../../constants'

import { HostList } from './HostList'

const Demo: Meta<typeof HostList> = {
  ...simpleComponentConfig,
  component: HostList,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Footer/HostTab/HostList'
}

const teamHosts: GetAllTeamHosts = {
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

const handleSelection = jest.fn()

const Template: StoryObj<typeof HostList> = {
  render: ({ ...args }) => {
    return (
      <MockedProvider>
        <ThemeProvider>
          <JourneyProvider value={{ ...args, variant: 'admin' }}>
            <Box sx={{ width: DRAWER_WIDTH }}>
              <HostList
                teamHosts={teamHosts}
                handleSelection={handleSelection}
              />
            </Box>
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )
  }
}

export const Default = {
  ...Template
}

export default Demo
