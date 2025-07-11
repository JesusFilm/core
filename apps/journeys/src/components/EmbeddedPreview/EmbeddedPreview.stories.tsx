import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'
import { expect, screen, userEvent, waitFor } from '@storybook/test'
import { SnackbarProvider } from 'notistack'
import { ReactElement } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { JourneyFields as Journey } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'

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
  videoBlocksNoPoster,
  videoBlocksNoVideo,
  videoLoop
} from '../../libs/testData/storyData'

import { EmbeddedPreview } from './EmbeddedPreview'

const Demo: Meta<typeof EmbeddedPreview> = {
  ...journeysConfig,
  component: EmbeddedPreview,
  title: 'Journeys/EmbeddedPreview',
  parameters: {
    ...journeysConfig.parameters,
    layout: 'fullscreen'
  }
}

const journey: Journey = {
  __typename: 'Journey',
  id: 'journeyId',
  themeName: ThemeName.base,
  themeMode: ThemeMode.light,
  title: 'My Journey',
  seoTitle: 'My Journey',
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
  slug: 'my journey',
  description: 'my cool journey',
  status: JourneyStatus.draft,
  createdAt: '2021-11-19T12:34:56.647Z',
  updatedAt: '2021-11-19T12:34:56.647Z',
  publishedAt: null,
  primaryImageBlock: null,
  creatorDescription: null,
  creatorImageBlock: null,
  userJourneys: [],
  featuredAt: null,
  strategySlug: null,
  seoDescription: null,
  template: null,
  chatButtons: [
    {
      __typename: 'ChatButton',
      id: 'chatButtonId',
      link: 'http://me.com',
      platform: MessagePlatform.facebook
    }
  ],
  host: {
    __typename: 'Host',
    id: 'hostId',
    teamId: 'teamId',
    title: 'Bob Jones and Michael Smith',
    location: 'Auckland, NZ',
    src1: 'https://tinyurl.com/3bxusmyb',
    src2: 'https://tinyurl.com/mr4a78kb'
  },
  team: null,
  blocks: basic,
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

const Template: StoryObj<typeof EmbeddedPreview> = {
  render: ({ ...args }): ReactElement => (
    <MockedProvider>
      <SnackbarProvider>
        <JourneyProvider
          value={{
            journey,
            variant: 'embed'
          }}
        >
          <EmbeddedPreview {...args} />
        </JourneyProvider>
      </SnackbarProvider>
    </MockedProvider>
  )
}

export const Default = {
  ...Template,
  args: {
    blocks: basic
  }
}

export const Opened = {
  ...Template,
  args: {
    blocks: imageBlocks
  },
  play: async () => {
    await waitFor(
      async () =>
        await expect(
          screen.getAllByTestId('JourneysCard-card0.id')[0]
        ).toBeInTheDocument()
    )
    const card = screen.getAllByTestId('JourneysCard-card0.id')[0]
    await userEvent.click(card)
  }
}

export const WithContent = {
  ...Template,
  args: {
    blocks: imageBlocks
  }
}

export const WithVideo = {
  ...Template,
  args: {
    blocks: videoBlocks
  }
}

export const WithVideoNoPoster = {
  ...Template,
  args: {
    blocks: videoBlocksNoPoster
  }
}

export const WithVideoNoVideo = {
  ...Template,
  args: {
    blocks: videoBlocksNoVideo
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

export default Demo
