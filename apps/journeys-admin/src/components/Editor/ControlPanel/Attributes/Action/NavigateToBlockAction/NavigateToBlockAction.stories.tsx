import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { EditorProvider } from '@core/journeys/ui'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { simpleComponentConfig } from '../../../../../../libs/storybook'
import { GetJourney_journey as Journey } from '../../../../../../../__generated__/GetJourney'
import {
  ThemeName,
  ThemeMode
} from '../../../../../../../__generated__/globalTypes'
import { JourneyProvider } from '../../../../../../libs/context'
import { steps } from '../data'
import { NavigateToBlockAction } from '.'

const NavigateToBlockActionStory = {
  ...simpleComponentConfig,
  component: NavigateToBlockAction,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Action/ActionStates'
}

const journeyTheme = {
  id: 'journeyId',
  themeMode: ThemeMode.light,
  themeName: ThemeName.base
} as unknown as Journey

export const NavigateToBlock: Story = () => {
  const selectedBlock = steps[4].children[0].children[4]

  return (
    <Stack spacing={10}>
      <Box>
        <Typography>Default</Typography>
        <MockedProvider>
          <JourneyProvider value={journeyTheme}>
            <EditorProvider initialState={{ steps }}>
              <NavigateToBlockAction />
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      </Box>

      <Box>
        <Typography>Selected card</Typography>
        <MockedProvider>
          <JourneyProvider value={journeyTheme}>
            <EditorProvider initialState={{ selectedBlock, steps }}>
              <NavigateToBlockAction />
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      </Box>
    </Stack>
  )
}

export default NavigateToBlockActionStory as Meta
