import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/nextjs'
import { screen, userEvent, waitFor } from 'storybook/test'

import {
  blocks,
  blocksWithStepBlockPosition
} from '@core/journeys/ui/TemplateView/data'
import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { GetJourney_journey as Journey } from '../../../__generated__/GetJourney'
import { GetStepBlocksWithPosition } from '../../../__generated__/GetStepBlocksWithPosition'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../__generated__/globalTypes'

import { GET_STEP_BLOCKS_WITH_POSITION } from './Slider/JourneyFlow/JourneyFlow'

import { Editor } from '.'

const EditorStory: Meta<typeof Editor> = {
  ...journeysAdminConfig,
  component: Editor,
  title: 'Journeys-Admin/Editor',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen',
    chromatic: {
      ...journeysAdminConfig.parameters.chromatic,
      diffThreshold: 0.75
    },
    docs: {
      source: { type: 'code' }
    }
  }
}

const journey: Journey = {
  __typename: 'Journey',
  id: 'journeyId',
  themeName: ThemeName.base,
  themeMode: ThemeMode.light,
  title: 'NUA Journey: Ep.3 – Decision',
  slug: 'nua-journey-ep-3-decision',
  description: 'my cool journey',
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
  status: JourneyStatus.draft,
  createdAt: '2021-11-19T12:34:56.647Z',
  updatedAt: '2021-11-19T12:34:56.647Z',
  publishedAt: null,
  primaryImageBlock: null,
  creatorDescription: null,
  creatorImageBlock: null,
  userJourneys: [],
  blocks,
  featuredAt: null,
  strategySlug: null,
  seoTitle: null,
  seoDescription: null,
  template: null,
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

const mockGetStepBlocksWithPosition: MockedResponse<GetStepBlocksWithPosition> =
  {
    request: {
      query: GET_STEP_BLOCKS_WITH_POSITION,
      variables: {
        journeyIds: [journey.id]
      }
    },
    result: {
      data: {
        blocks: blocksWithStepBlockPosition
      }
    }
  }

const Template: StoryObj<typeof Editor> = {
  render: (args) => {
    return (
      <MockedProvider mocks={[mockGetStepBlocksWithPosition]}>
        <Editor journey={args.journey} initialState={args.initialState} />
      </MockedProvider>
    )
  }
}

export const Default = {
  ...Template,
  args: { journey }
}

export const SocialPreview = {
  ...Template,
  args: { journey },
  play: async () => {
    await waitFor(async () => {
      screen.getByTestId('SocialPreviewNode')
    })

    const socialPreviewNode = screen.getByTestId('SocialPreviewNode')
    await userEvent.click(socialPreviewNode)

    await waitFor(async () => {
      await screen.getByText('Social Post View')
    })
  }
}

export const Goals = {
  ...Template,
  args: { journey },
  play: async () => {
    const button = screen.queryByRole('button', { name: 'Strategy' })
    if (button != null) {
      await userEvent.click(button)
    } else {
      const menu = screen.getByTestId('ToolbarMenuButton')
      await userEvent.click(menu)
      const menuItem = screen.getByRole('menuitem', { name: 'Strategy' })
      await userEvent.click(menuItem)
    }
    await waitFor(async () => {
      await screen.getByText('Every Journey has a goal')
    })
  }
}

export const Loading = {
  ...Template,
  args: {
    journey: undefined
  }
}

export const RTL = {
  ...Template,
  args: {
    journey: {
      ...journey,
      language: {
        __typename: 'Language',
        id: '529',
        bcp47: 'ar',
        name: [
          {
            __typename: 'LanguageName',
            value: 'Arabic',
            primary: true
          }
        ]
      }
    }
  }
}

export default EditorStory
