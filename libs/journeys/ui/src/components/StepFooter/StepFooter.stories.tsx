import { ComponentProps } from 'react'
import { Story, Meta } from '@storybook/react'
import Stack from '@mui/material/Stack'
import { MockedProvider } from '@apollo/client/testing'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'
import { SnackbarProvider } from 'notistack'
import { journeyUiConfig } from '../../libs/journeyUiConfig'

import {
  ThemeMode,
  ThemeName,
  JourneyStatus,
  ChatPlatform
} from '../../../__generated__/globalTypes'

import { JourneyProvider } from '../../libs/JourneyProvider'
import {
  JourneyFields as Journey,
  JourneyFields_host as Host,
  JourneyFields_language as Language
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
  chatButtons: [],
  host: null,
  team: null
}

const rtlLanguage = {
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
} as unknown as Language

const Template: Story<
  ComponentProps<typeof StepFooter> & { journey: Journey; admin: boolean }
> = ({ journey, admin = false }) => {
  return (
    <MockedProvider>
      <SnackbarProvider>
        <FlagsProvider flags={{ editableStepFooter: true }}>
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
        </FlagsProvider>
      </SnackbarProvider>
    </MockedProvider>
  )
}

// StepFooter exists only on dark mode on desktop view
export const Default = Template.bind({})
Default.args = { journey }

export const Admin = Template.bind({})
Admin.args = {
  ...Default.args,
  admin: true
}

export const WithHost = Template.bind({})
WithHost.args = {
  ...Default.args,
  journey: {
    ...journey,
    host: {
      id: 'hostId',
      __typename: 'Host',
      title: 'Cru International',
      location: 'Florida, USA',
      teamId: 'teamId',
      src1: null,
      src2: null
    } as unknown as Host
  }
}

export const WithAvatar = Template.bind({})
WithAvatar.args = {
  ...WithHost.args,
  journey: {
    ...journey,
    host: {
      id: 'hostId',
      __typename: 'Host',
      title: 'Cru International',
      teamId: 'teamId',
      src1: 'https://images.unsplash.com/photo-1558704164-ab7a0016c1f3?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
      src2: null
    } as unknown as Host
  }
}

export const WithChat = Template.bind({})
WithChat.args = {
  ...Default.args,
  journey: {
    ...journey,
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

export const Long = Template.bind({})
Long.args = {
  ...Default.args,
  journey: {
    ...journey,
    seoTitle:
      'Some really really really really incredibly absolutely humungo wungo massively very very very long beyond a shadow of a doubt, needed only for testing a very strange edge case where a title is really really long - title',
    host: {
      id: 'hostId',
      __typename: 'Host',
      title: 'Cru International is a host title which can be very long',
      teamId: 'teamId',
      location:
        'Florida, USA is an example of a host location which also can be very long',
      src1: 'https://images.unsplash.com/photo-1558704164-ab7a0016c1f3?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
      src2: 'https://images.unsplash.com/photo-1477936821694-ec4233a9a1a0?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1136&q=80'
    } as unknown as Host,
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

const TemplateRTL: Story<
  ComponentProps<typeof StepFooter> & { journeys: Journey[]; admin: boolean[] }
> = ({ journeys, admin }) => {
  return (
    <MockedProvider>
      <SnackbarProvider>
        <FlagsProvider flags={{ editableStepFooter: true }}>
          {journeys.map((journey, i) => (
            <JourneyProvider key={i} value={{ journey, admin: admin[i] }}>
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
          ))}
        </FlagsProvider>
      </SnackbarProvider>
    </MockedProvider>
  )
}

export const RTL = TemplateRTL.bind({})
RTL.args = {
  journeys: [
    { ...(Default.args.journey as Journey), language: rtlLanguage },
    { ...(Default.args.journey as Journey), language: rtlLanguage },
    { ...(WithChat.args.journey as Journey), language: rtlLanguage },
    { ...(WithHost.args.journey as Journey), language: rtlLanguage },
    { ...(WithAvatar.args.journey as Journey), language: rtlLanguage },
    { ...(Long.args.journey as Journey), language: rtlLanguage }
  ],
  admin: [true, false, false, false, false, false]
}
RTL.parameters = { rtl: true }

export default Demo as Meta
