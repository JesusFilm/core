import { Story, Meta } from '@storybook/react'
import { EditorProvider, TreeBlock } from '@core/journeys/ui'
import { MockedProvider } from '@apollo/client/testing'
import { JourneyProvider } from '../../../../../libs/context'
import { journeysAdminConfig } from '../../../../../libs/storybook'
import { GetJourney_journey as Journey } from '../../../../../../__generated__/GetJourney'
import {
  ThemeMode,
  ThemeName,
  JourneyStatus
} from '../../../../../../__generated__/globalTypes'
import { Drawer } from '../../../Drawer'
import { GET_JOURNEY_NAMES } from './NavigateToJourneyAction/NavigateToJourneyAction'
import { Action, ACTION_DELETE, NAVIGATE_ACTION_UPDATE } from './Action'
import { steps } from './data'

const ActionStory = {
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
  locale: 'en-US',
  description: 'my cool journey',
  status: JourneyStatus.draft,
  createdAt: '2021-11-19T12:34:56.647Z',
  publishedAt: null,
  blocks: [] as TreeBlock[],
  primaryImageBlock: null,
  userJourneys: []
}

const selectedStep = steps[1]
const selectedBlock = selectedStep?.children[0].children[3]

export const Default: Story = () => {
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
              id: selectedBlock.id,
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
        },
        {
          request: {
            query: ACTION_DELETE,
            variables: {
              journeyId: 'journeyId',
              id: selectedBlock.id
            }
          },
          result: {
            data: {
              blockDeleteAction: {
                id: 'journeyId'
              }
            }
          }
        }
      ]}
    >
      <JourneyProvider value={journey}>
        <EditorProvider
          initialState={{
            steps,
            selectedStep,
            selectedBlock,
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

export default ActionStory as Meta
