import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/nextjs'
import { ComponentProps } from 'react'
import { fn } from 'storybook/test'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { JourneyFields as Journey } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { GetAllTeamHosts_hosts as Host } from '../../../../../../../../../__generated__/GetAllTeamHosts'
import { ThemeProvider } from '../../../../../../../ThemeProvider'
import { DRAWER_WIDTH } from '../../../../../../constants'

import { HostForm } from './HostForm'

const Demo: Meta<typeof HostForm> = {
  ...simpleComponentConfig,
  component: HostForm,
  title:
    'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/JourneyAppearance/Host/HostForm'
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
        __typename: 'LanguageName'
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
      handleSelection: fn(),
      getAllTeamHosts: fn()
    }
  }
}

export const Filled = {
  ...Template,
  args: {
    journey,
    componentProps: {
      handleSelection: fn(),
      getAllTeamHosts: fn()
    }
  }
}

export default Demo
