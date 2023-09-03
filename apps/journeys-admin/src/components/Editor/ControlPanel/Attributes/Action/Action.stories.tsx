import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'
import { screen, userEvent } from '@storybook/testing-library'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { GetJourney_journey as Journey } from '../../../../../../__generated__/GetJourney'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../../../../__generated__/globalTypes'
import { journeysAdminConfig } from '../../../../../libs/storybook'
import { Drawer } from '../../../Drawer'

import { Action, NAVIGATE_ACTION_UPDATE } from './Action'
import { steps } from './data'
import { GET_JOURNEY_NAMES } from './NavigateToJourneyAction/NavigateToJourneyAction'

const ActionStory: Meta<typeof Action> = {
  ...journeysAdminConfig,
  component: Action,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Action'
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
  blocks: [] as TreeBlock[],
  primaryImageBlock: null,
  userJourneys: [],
  template: null,
  seoTitle: null,
  seoDescription: null,
  chatButtons: [],
  host: null,
  team: null
}

const Template: StoryObj<typeof Action> = {
  render: ({ ...args }) => {
    return (
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_JOURNEY_NAMES
            },
            result: {
              data: {
                journeys: [journey]
              }
            }
          },
          {
            request: {
              query: NAVIGATE_ACTION_UPDATE,
              variables: {
                id: steps[0].id,
                journeyId: 'journeyId',
                input: {}
              }
            },
            result: {
              data: {
                blockUpdateNavigateAction: {
                  id: 'journeyId',
                  gtmEventName: 'gtmEventName'
                }
              }
            }
          }
        ]}
      >
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <EditorProvider
            initialState={{
              ...args,
              drawerChildren: <Action />,
              drawerTitle: 'Action',
              drawerMobileOpen: true
            }}
          >
            <Drawer />
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

export const NavigateAction = {
  ...Template,
  args: {
    steps,
    selectedStep: steps[3],
    selectedBlock: steps[3].children[0].children[2]
  }
}
export const NavigateToBlockAction = {
  ...Template,
  args: {
    steps,
    selectedBlock: steps[4].children[0].children[4]
  }
}

export const NavigateToJourneyAction = {
  ...Template,
  args: {
    steps,
    selectedBlock: steps[0].children[0].children[3]
  }
}

export default ActionStory
