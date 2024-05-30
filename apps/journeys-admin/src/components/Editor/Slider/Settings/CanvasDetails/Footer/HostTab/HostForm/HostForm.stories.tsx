import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { jest } from '@storybook/jest'
import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { JourneyFields as Journey } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'

import { GetAllTeamHosts_hosts as Host } from '../../../../../../../../../__generated__/GetAllTeamHosts'
import { simpleComponentConfig } from '../../../../../../../../libs/storybook'
import { ThemeProvider } from '../../../../../../../ThemeProvider'
import { DRAWER_WIDTH } from '../../../../../../constants'

import { HostForm } from './HostForm'

const Demo: Meta<typeof HostForm> = {
  ...simpleComponentConfig,
  component: HostForm,
  title:
    'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/Footer/HostTab/HostForm'
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
  team: { id: 'teamId', title: 'My team' },
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

const Template: StoryObj<{
  journey: Journey
  componentProps: ComponentProps<typeof HostForm>
}> = {
  render: ({ journey, componentProps }) => {
    return (
      <MockedProvider>
        <ThemeProvider>
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            <Box sx={{ width: DRAWER_WIDTH }}>
              <HostForm {...componentProps} />
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
      handleSelection: jest.fn(),
      getAllTeamHosts: jest.fn()
    }
  }
}

export const Filled = {
  ...Template,
  args: {
    journey,
    componentProps: {
      handleSelection: jest.fn(),
      getAllTeamHosts: jest.fn()
    }
  }
}

export default Demo
