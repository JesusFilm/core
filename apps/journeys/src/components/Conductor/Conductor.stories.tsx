import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'
import { expect, screen, userEvent, waitFor } from '@storybook/test'
import { SnackbarProvider } from 'notistack'
import { ComponentProps } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import {
  JourneyFields as Journey,
  JourneyFields_language as Language
} from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'

import {
  JourneyStatus,
  MessagePlatform,
  ThemeMode,
  ThemeName
} from '../../../__generated__/globalTypes'
import { journeysConfig } from '../../libs/storybook'
import {
  basic,
  imageBlocks,
  videoBlocks,
  videoLoop
} from '../../libs/testData/storyData'

import { Conductor } from '.'

const Demo: Meta<typeof Conductor> = {
  ...journeysConfig,
  component: Conductor,
  title: 'Journeys/Conductor',
  parameters: {
    ...journeysConfig.parameters,
    layout: 'fullscreen'
  }
}

const rtlLanguage: Language = {
  __typename: 'Language',
  id: '529',
  bcp47: 'ar',
  iso3: 'arb',
  name: [
    {
      __typename: 'LanguageName',
      value: 'Arabic',
      primary: false
    }
  ]
}

const defaultJourney: Journey = {
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
  team: null,
  tags: [],
  website: null,
  showShareButton: null,
  showLikeButton: null,
  showDislikeButton: null,
  displayTitle: null,
  logoImageBlock: null,
  menuButtonIcon: null,
  menuStepBlock: null,
  socialNodeX: null,
  socialNodeY: null,
  journeyTheme: null,
  journeyCustomizationDescription: null,
  journeyCustomizationFields: [],
  fromTemplateId: null
}

type Story = StoryObj<ComponentProps<typeof Conductor> & { journey?: Journey }>

const Template: Story = {
  render: ({ journey = defaultJourney, ...args }) => (
    <MockedProvider mocks={[]}>
      <JourneyProvider value={{ journey }}>
        <SnackbarProvider>
          <Conductor {...args} />
        </SnackbarProvider>
      </JourneyProvider>
    </MockedProvider>
  )
}

export const Default = {
  ...Template,
  args: {
    blocks: basic
  }
}

export const WithContent = {
  ...Template,
  args: {
    journey: {
      ...defaultJourney,
      chatButtons: [
        {
          __typename: 'ChatButton',
          id: '1',
          link: 'https://m.me/',
          platform: MessagePlatform.tikTok
        },
        {
          __typename: 'ChatButton',
          id: '1',
          link: 'https://m.me/',
          platform: MessagePlatform.snapchat
        }
      ]
    },
    blocks: imageBlocks
  },
  play: async () => {
    const nextButton = screen.getAllByTestId('ConductorNavigationButtonNext')[0]
    await userEvent.click(nextButton)
    await waitFor(async () => {
      await expect(
        screen.getAllByTestId('ConductorNavigationContainerPrevious')[1]
      ).toBeInTheDocument()
    })
  }
}

export const WithVideo = {
  ...Template,
  args: {
    blocks: videoBlocks
  }
}

export const WithVideoLoop = {
  ...Template,
  args: {
    blocks: videoLoop
  },
  parameters: {
    chromatic: { disableSnapshot: true }
  }
}

export const RTL = {
  ...Template,
  args: {
    journey: { ...defaultJourney, language: rtlLanguage },
    blocks: basic
  },
  parameters: {
    rtl: true
  }
}

export default Demo
