import { MockedProvider } from '@apollo/client/testing'
import Stack from '@mui/material/Stack'
import { Meta, StoryObj } from '@storybook/react'
import { SnackbarProvider } from 'notistack'
import { ComponentProps } from 'react'

import {
  JourneyStatus,
  MessagePlatform,
  ThemeMode,
  ThemeName
} from '../../../__generated__/globalTypes'
import { JourneyProvider } from '../../libs/JourneyProvider'
import {
  JourneyFields_host as Host,
  JourneyFields as Journey,
  JourneyFields_language as Language
} from '../../libs/JourneyProvider/__generated__/JourneyFields'
import { journeyUiConfig } from '../../libs/journeyUiConfig'

import { StepFooter } from './StepFooter'

const Demo: Meta<typeof StepFooter> = {
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
  featuredAt: null,
  strategySlug: null,

  slug: 'my-journey',
  language: {
    __typename: 'Language',
    id: '529',
    bcp47: 'en',
    iso3: 'eng',
    name: [
      {
        __typename: 'LanguageName',
        value: 'English',
        primary: true
      }
    ]
  },
  description: 'my cool journey',
  status: JourneyStatus.draft,
  createdAt: '2021-11-19T12:34:56.647Z',
  updatedAt: '2021-11-19T12:34:56.647Z',
  publishedAt: null,
  blocks: [],
  primaryImageBlock: null,
  creatorDescription: null,
  creatorImageBlock: null,
  userJourneys: [],
  template: null,
  seoTitle: null,
  seoDescription: null,
  chatButtons: [],
  host: null,
  team: { __typename: 'Team', id: 'teamId', title: 'My Team', publicTitle: '' },
  tags: [],
  website: null,
  showShareButton: null,
  showLikeButton: null,
  showDislikeButton: null,
  displayTitle: null,
  logoImageBlock: null,
  menuButtonIcon: null,
  menuStepBlock: null,
  journeyTheme: null
}

const rtlLanguage = {
  __typename: 'Language',
  id: '529',
  bcp47: 'ar',
  iso3: 'ara',
  name: [
    {
      __typename: 'LanguageName',
      value: 'Arabic',
      primary: true
    }
  ]
} as unknown as Language

type Story = StoryObj<
  ComponentProps<typeof StepFooter> & {
    journey: Journey
    variant: 'default' | 'admin' | 'embed'
  }
>

const Template: Story = {
  render: ({ journey, variant = 'default' }) => {
    return (
      <MockedProvider>
        <SnackbarProvider>
          <JourneyProvider value={{ journey, variant }}>
            <Stack
              sx={{
                position: 'relative',
                height: { xs: 119, sm: 70, lg: 78 },
                justifyContent: 'center'
              }}
            >
              <StepFooter sx={{ border: '1px solid black' }} />
            </Stack>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
  }
}

// StepFooter exists only on dark mode on desktop view
export const Default = {
  ...Template,
  args: { journey }
}

export const Admin = {
  ...Template,
  args: {
    ...Default.args,
    variant: 'admin'
  }
}

export const WithHost = {
  ...Template,
  args: {
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
}

export const WithAvatar = {
  ...Template,
  args: {
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
}

export const WithAdminAvatar = {
  ...Template,
  args: {
    ...Admin.args,
    ...WithAvatar.args
  }
}

export const WithChat = {
  ...Template,
  args: {
    ...Default.args,
    journey: {
      ...journey,
      chatButtons: [
        {
          __typename: 'ChatButton',
          id: '1',
          link: 'https://m.me/',
          platform: MessagePlatform.facebook
        }
      ]
    }
  }
}

export const Long = {
  ...Template,
  args: {
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
          platform: MessagePlatform.facebook
        },
        {
          __typename: 'ChatButton',
          id: '1',
          link: 'https://m.me/',
          platform: MessagePlatform.snapchat
        }
      ]
    }
  }
}

type StoryRTL = StoryObj<
  ComponentProps<typeof StepFooter> & {
    journeys: Journey[]
    variants: Array<'default' | 'admin' | 'embed'>
  }
>

const TemplateRTL: StoryRTL = {
  render: ({ journeys, variants }) => {
    return (
      <MockedProvider>
        <SnackbarProvider>
          {journeys.map((journey, i) => (
            <JourneyProvider key={i} value={{ journey, variant: variants[i] }}>
              <Stack
                sx={{
                  position: 'relative',
                  height: { xs: 118, sm: 69, lg: 77 },
                  justifyContent: 'center'
                }}
              >
                <StepFooter sx={{ border: '1px solid black' }} />
              </Stack>
            </JourneyProvider>
          ))}
        </SnackbarProvider>
      </MockedProvider>
    )
  }
}

export const RTL = {
  ...TemplateRTL,
  args: {
    journeys: [
      { ...Default.args.journey, language: rtlLanguage },
      { ...Default.args.journey, language: rtlLanguage },
      { ...(WithChat.args.journey as Journey), language: rtlLanguage },
      { ...(WithHost.args.journey as Journey), language: rtlLanguage },
      { ...(WithAvatar.args.journey as Journey), language: rtlLanguage },
      { ...(WithAdminAvatar.args.journey as Journey), language: rtlLanguage },
      { ...(Long.args.journey as Journey), language: rtlLanguage }
    ],
    variants: [
      'admin',
      'default',
      'default',
      'default',
      'default',
      'admin',
      'default'
    ]
  },
  parameters: { rtl: true }
}

export default Demo
