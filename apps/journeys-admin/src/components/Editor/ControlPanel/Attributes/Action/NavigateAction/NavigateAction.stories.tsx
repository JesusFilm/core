import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { EditorProvider, JourneyProvider } from '@core/journeys/ui'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { simpleComponentConfig } from '../../../../../../libs/storybook'

import {
  ThemeName,
  ThemeMode
} from '../../../../../../../__generated__/globalTypes'
import { GetJourney_journey as Journey } from '../../../../../../../__generated__/GetJourney'
import { steps } from '../data'
import { NavigateAction } from '.'

const NavigateNextStory = {
  ...simpleComponentConfig,
  component: NavigateAction,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Action/ActionStates',
  parameters: {
    ...simpleComponentConfig.parameters,
    chromatic: {
      ...simpleComponentConfig.parameters.chromatic,
      diffThreshold: 0.9
    }
  }
}

const journeyTheme = {
  id: 'journeyId',
  themeMode: ThemeMode.light,
  themeName: ThemeName.base
} as unknown as Journey

export const Navigate: Story = () => {
  const selectedStep = steps[3]

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

export default NavigateNextStory as Meta
