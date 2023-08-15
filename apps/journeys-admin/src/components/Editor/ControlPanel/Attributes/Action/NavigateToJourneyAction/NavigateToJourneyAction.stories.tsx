import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Meta, Story } from '@storybook/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { GetJourney_journey as Journey } from '../../../../../../../__generated__/GetJourney'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../../../../../__generated__/globalTypes'
import { simpleComponentConfig } from '../../../../../../libs/storybook'
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
          <JourneyProvider value={{ journey, variant: 'admin' }}>
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
