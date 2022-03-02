import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { EditorProvider, TreeBlock } from '@core/journeys/ui'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { simpleComponentConfig } from '../../../../../../libs/storybook'
import { GetJourney_journey as Journey } from '../../../../../../../__generated__/GetJourney'
import { JourneyProvider } from '../../../../../../libs/context'
import {
  ThemeMode,
  ThemeName,
  JourneyStatus
} from '../../../../../../../__generated__/globalTypes'
import { steps } from '../data'
import { GET_JOURNEY_NAMES } from './NavigateToJourneyAction'
import { NavigateToJourneyAction } from '.'

const NavigateToJourneyActionStory = {
  ...simpleComponentConfig,
  component: NavigateToJourneyAction,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Action/ActionStates'
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

export const NavigateToJourney: Story = () => {
  const selectedBlock = steps[0].children[0].children[3]
  return (
    <Stack spacing={10}>
      <Box>
        <Typography>Default</Typography>
        <MockedProvider>
          <NavigateToJourneyAction />
        </MockedProvider>
      </Box>

      <Box>
        <Typography>Selected Journey</Typography>
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
            }
          ]}
        >
          <JourneyProvider value={journey}>
            <EditorProvider initialState={{ selectedBlock }}>
              <NavigateToJourneyAction />
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      </Box>
    </Stack>
  )
}

export default NavigateToJourneyActionStory as Meta
