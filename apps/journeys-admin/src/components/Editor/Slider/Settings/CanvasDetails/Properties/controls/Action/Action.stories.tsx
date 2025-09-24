import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'
import { screen, userEvent } from '@storybook/test'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { GetJourney_journey as Journey } from '../../../../../../../../../__generated__/GetJourney'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../../../../../../../__generated__/globalTypes'

import { Action } from './Action'
import { steps } from './data'

const ActionStory: Meta<typeof Action> = {
  ...journeysAdminConfig,
  component: Action,
  title:
    'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/Properties/controls/Action'
}

const journey: Journey = {
  __typename: 'Journey',
  id: 'journeyId',
  themeName: ThemeName.base,
  themeMode: ThemeMode.light,
  title: 'my journey',
  slug: 'my-journey',
  strategySlug: null,
  featuredAt: null,
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
  blocks: [] as TreeBlock[],
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
  journeyTheme: null
}

const Template: StoryObj<typeof Action> = {
  render: ({ ...args }) => {
    return (
      <MockedProvider>
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <EditorProvider
            initialState={{
              ...args
            }}
          >
            <Action />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
  }
}

export const Default = {
  ...Template,
  args: {
    steps,
    selectedStep: steps[1]
  },
  play: async () => {
    const dropDown = screen.getByRole('button', { name: 'None' })
    await userEvent.click(dropDown)
  }
}

export const DisabledNextStep = {
  ...Template,
  args: {
    steps,
    selectedStep: steps[4]
  },
  play: async () => {
    const dropDown = screen.getByRole('button', { name: 'None' })
    await userEvent.click(dropDown)
  }
}

export const LinkAction = {
  ...Template,
  args: {
    selectedBlock: steps[1].children[0].children[3]
  }
}

export const EmailAction = {
  ...Template,
  args: {
    selectedBlock: steps[1].children[0].children[4]
  }
}

export const NavigateToBlockAction = {
  ...Template,
  args: {
    steps,
    selectedBlock: steps[4].children[0].children[4]
  }
}

export default ActionStory
