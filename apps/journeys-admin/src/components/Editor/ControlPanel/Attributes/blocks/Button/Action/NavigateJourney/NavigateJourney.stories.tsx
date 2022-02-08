import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { EditorProvider, TreeBlock } from '@core/journeys/ui'
import { simpleComponentConfig } from '../../../../../../../../libs/storybook'
import {
  GetJourney_journey_blocks_ButtonBlock as ButtonBlock,
  GetJourney_journey as Journey
} from '../../../../../../../../../__generated__/GetJourney'
import { JourneyProvider } from '../../../../../../../../libs/context'
import {
  ThemeMode,
  ThemeName,
  JourneyStatus
} from '../../../../../../../../../__generated__/globalTypes'
import { GET_JOURNEYS_NAMES } from './NavigateJourney'
import { NavigateJourney } from '.'

const NavigateJourneyStory = {
  ...simpleComponentConfig,
  component: NavigateJourney,
  title:
    'Journeys-Admin/Editor/ControlPanel/Attributes/Button/Action/NavigateJourney'
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

export const Default: Story = () => {
  return (
    <MockedProvider>
      <NavigateJourney />
    </MockedProvider>
  )
}

export const WithSelected: Story = () => {
  const selectedBlock: TreeBlock<ButtonBlock> = {
    __typename: 'ButtonBlock',
    id: 'journeyId',
    parentBlockId: 'parentBlockId',
    parentOrder: 0,
    label: 'test button',
    buttonVariant: null,
    buttonColor: null,
    size: null,
    startIcon: null,
    endIcon: null,
    action: {
      __typename: 'NavigateToJourneyAction',
      gtmEventName: 'gtmEventName',
      journey: {
        __typename: 'Journey',
        id: journey.id,
        slug: journey.slug
      }
    },
    children: []
  }

  return (
    <MockedProvider
      mocks={[
        {
          request: {
            query: GET_JOURNEYS_NAMES
          },
          result: {
            data: {
              journeys: [journey]
            }
          }
        }
      ]}
    >
      <JourneyProvider value={journey}>
        <EditorProvider initialState={{ selectedBlock }}>
          <NavigateJourney />
        </EditorProvider>
      </JourneyProvider>
    </MockedProvider>
  )
}

export default NavigateJourneyStory as Meta
