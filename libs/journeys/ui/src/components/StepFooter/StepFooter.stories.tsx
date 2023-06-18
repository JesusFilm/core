import { ComponentProps } from 'react'
import { Story, Meta } from '@storybook/react'
import Stack from '@mui/material/Stack'
import { MockedProvider } from '@apollo/client/testing'
import { journeyUiConfig } from '../../libs/journeyUiConfig'

import {
  ThemeMode,
  ThemeName,
  JourneyStatus,
  ChatPlatform
} from '../../../__generated__/globalTypes'

import { JourneyProvider } from '../../libs/JourneyProvider'
import { JourneyFields as Journey } from '../../libs/JourneyProvider/__generated__/JourneyFields'
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
  chatButtons: [],
  host: {
    id: 'hostId',
    __typename: 'Host',
    teamId: 'teamId',
    title: 'Cru International',
    location: 'Florida, USA',
    src1: null,
    src2: null
  }
}

const Template: Story<
  ComponentProps<typeof StepFooter> & { journey: Journey }
> = ({ journey }) => {
  return (
    <MockedProvider>
      <JourneyProvider value={{ journey }}>
        <Stack
          sx={{
            position: 'relative',
            width: '100%',
            height: 64,
            border: '1px solid black',
            justifyContent: 'center'
          }}
        >
          <StepFooter />
        </Stack>
      </JourneyProvider>
    </MockedProvider>
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
    chatButtons: [
      {
        __typename: 'ChatButton',
        id: '1',
        link: 'https://m.me/',
        platform: ChatPlatform.facebook
      },
      {
        __typename: 'ChatButton',
        id: '1',
        link: 'https://m.me/',
        platform: ChatPlatform.snapchat
      }
    ]
  }
}

export const RTL = Template.bind({})
RTL.args = {
  journey: {
    ...journey,
    language: {
      __typename: 'Language',
      id: '529',
      bcp47: 'ar',
      iso3: 'ara',
      name: [
        {
          __typename: 'Translation',
          value: 'Arabic',
          primary: true
        }
      ]
    },
    chatButtons: [
      {
        __typename: 'ChatButton',
        id: '1',
        link: 'https://m.me/',
        platform: ChatPlatform.facebook
      }
    ]
  }
}
RTL.parameters = { rtl: true }

export default Demo as Meta
