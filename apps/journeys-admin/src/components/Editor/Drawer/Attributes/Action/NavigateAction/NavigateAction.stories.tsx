import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Meta, StoryObj } from '@storybook/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import {
  GetJourney_journey as Journey,
  GetJourney_journey_blocks_StepBlock as StepBlock
} from '../../../../../../../__generated__/GetJourney'
import {
  ThemeMode,
  ThemeName
} from '../../../../../../../__generated__/globalTypes'
import { simpleComponentConfig } from '../../../../../../libs/storybook'
import { steps } from '../data'

import { NavigateAction } from '.'

const NavigateNextStory: Meta<typeof NavigateAction> = {
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

const Template: StoryObj<typeof NavigateAction> = {
  render: (selectedStep: TreeBlock<StepBlock>) => {
    return (
      <Stack spacing={10}>
        <Box>
          <Typography>Default</Typography>
          <MockedProvider>
            <JourneyProvider
              value={{
                journey: journeyTheme,
                variant: 'admin'
              }}
            >
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
}

export const Default = {
  ...Template,
  args: {
    ...steps[0],
    nextBlockId: null
  }
}

export const SelectedNextStep = {
  ...Template,
  args: {
    ...steps[0],
    nextBlockId: steps[4].id
  }
}

export default NavigateNextStory
