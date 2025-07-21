import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/nextjs'
import { fn } from 'storybook/test'
import { ComponentProps } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { JourneyFields as Journey } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { GetAllTeamHosts } from '../../../../../../../../../__generated__/GetAllTeamHosts'
import { ThemeProvider } from '../../../../../../../ThemeProvider'
import { DRAWER_WIDTH } from '../../../../../../constants'

import { HostList } from './HostList'

const Demo: Meta<typeof HostList> = {
  ...simpleComponentConfig,
  component: HostList,
  title:
    'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/JourneyAppearance/Host/HostList'
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
        __typename: 'LanguageName'
      }
    ]
  },
  host: null
} as unknown as Journey

const handleSelection = fn()

const Template: StoryObj<{
  journey: Journey
  componentProps: ComponentProps<typeof HostList>
}> = {
  render: ({ journey, componentProps }) => {
    return (
      <MockedProvider>
        <ThemeProvider>
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            <Box sx={{ width: DRAWER_WIDTH }}>
              <HostList {...componentProps} />
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
    journey,
    componentProps: {
      teamHosts,
      handleSelection
    }
  }
}

export default Demo
