import { ComponentProps } from 'react'
import { Story, Meta } from '@storybook/react'
import Stack from '@mui/material/Stack'
import { journeyUiConfig } from '../../libs/journeyUiConfig'

import {
  ThemeMode,
  ThemeName,
  JourneyStatus
} from '../../../__generated__/globalTypes'

import { JourneyProvider } from '../../libs/JourneyProvider'
import {
  JourneyFields as Journey,
  JourneyFields_host as Host
} from '../../libs/JourneyProvider/__generated__/JourneyFields'
import { StepFooter } from './StepFooter'

const Demo = {
  ...journeyUiConfig,
  component: StepFooter,
  title: 'Journeys-Ui/StepFooter',
  parameters: {
    ...journeyUiConfig.parameters,
    layout: 'fullscreen'
  }
}

const journey: Journey = {
  __typename: 'Journey',
  id: 'journeyId',
  themeName: ThemeName.base,
  themeMode: ThemeMode.light,
  title: 'my journey',
  slug: 'my-journey',
  language: {
    __typename: 'Language',
    id: '529',
    bcp47: 'en',
    iso3: 'eng',
    name: [
      {
        __typename: 'Translation',
        value: 'English',
        primary: true
      }
    ]
  },
  description: 'my cool journey',
  status: JourneyStatus.draft,
  createdAt: '2021-11-19T12:34:56.647Z',
  publishedAt: null,
  blocks: [],
  primaryImageBlock: null,
  userJourneys: [],
  template: null,
  seoTitle: null,
  seoDescription: null,
  host: {
    id: 'hostId',
    __typename: 'Host',
    title: 'Cru International',
    location: 'Florida, USA',
    teamId: 'teamId',
    src1: 'https://images.unsplash.com/photo-1558704164-ab7a0016c1f3?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    src2: null
  } as unknown as Host
}

const Template: Story<
  ComponentProps<typeof StepFooter> & { journey: Journey; admin: boolean }
> = ({ journey, admin = false }) => {
  return (
    <JourneyProvider value={{ journey, admin }}>
      <Stack
        sx={{
          position: 'relative',
          height: 80,
          justifyContent: 'center'
        }}
      >
        <StepFooter sx={{ border: '1px solid black' }} />
      </Stack>
    </JourneyProvider>
  )
}

// StepFooter exists only on dark mode on desktop view
export const Default = Template.bind({})
Default.args = {
  journey
}

export const Long = Template.bind({})
Long.args = {
  ...Default.args,
  journey: {
    ...journey,
    seoTitle:
      'Some really really really really incredibly absolutely humungo wungo massively very very very long beyond a shadow of a doubt, needed only for testing a very strange edge case where a title is really really long - title',
    host: {
      ...journey.host,
      src2: 'https://images.unsplash.com/photo-1477936821694-ec4233a9a1a0?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1136&q=80'
    } as unknown as Host
  }
}

export const RTL = Template.bind({})
RTL.args = { ...Default.args }
RTL.parameters = { rtl: true }

export const Admin = Template.bind({})
Admin.args = {
  ...Default.args,
  admin: true
}

export default Demo as Meta
