import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { TreeBlock } from '@core/journeys/ui/block'
import { simpleComponentConfig } from '../../../../../../libs/storybook'

import {
  ThemeName,
  ThemeMode
} from '../../../../../../../__generated__/globalTypes'
import {
  GetJourney_journey as Journey,
  GetJourney_journey_blocks_StepBlock as StepBlock
} from '../../../../../../../__generated__/GetJourney'
import { steps } from '../data'
import { NavigateAction } from '.'

const NavigateNextStory = {
  ...simpleComponentConfig,
  component: NavigateAction,
  title:
    'Journeys-Admin/Editor/ControlPanel/Attributes/Action/ActionStates/NavigateAction'
}

const journeyTheme = {
  id: 'journeyId',
  themeMode: ThemeMode.light,
  themeName: ThemeName.base,
  language: {
    __typename: 'Language',
    id: '529',
    bcp47: 'en',
    iso3: 'eng'
  }
} as unknown as Journey

const Template: Story = (selectedStep: TreeBlock<StepBlock>) => {
  return (
    <Stack spacing={10}>
      <Box>
        <Typography>Default</Typography>
        <MockedProvider>
          <JourneyProvider value={{ journey: journeyTheme, admin: true }}>
            <EditorProvider
              initialState={{
                steps,
                selectedStep
              }}
            >
              <NavigateAction />
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      </Box>
    </Stack>
  )
}

export const Default = Template.bind({})
Default.args = {
  ...steps[0],
  nextBlockId: null
}

export const SelectedNextStep = Template.bind({})
SelectedNextStep.args = {
  ...steps[0],
  nextBlockId: steps[4].id
}

export default NavigateNextStory as Meta
