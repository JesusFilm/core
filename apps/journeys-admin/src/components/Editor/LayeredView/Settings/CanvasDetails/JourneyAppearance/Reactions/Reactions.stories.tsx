import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/nextjs'
import { screen, userEvent } from 'storybook/test'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { DRAWER_WIDTH } from '../../../../../constants'

import { Reactions } from '.'

const ReactionsStory: Meta<typeof Reactions> = {
  ...simpleComponentConfig,
  component: Reactions,
  title:
    'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/JourneyAppearance/Reactions'
}

const Template: StoryObj<typeof Reactions> = {
  render: () => (
    <MockedProvider>
      <EditorProvider>
        <Box sx={{ width: DRAWER_WIDTH }}>
          <Reactions />
        </Box>
      </EditorProvider>
    </MockedProvider>
  )
}

export const Default = { ...Template }

export const Open = {
  ...Template,
  play: async () => {
    const button = screen.getByRole('button', { name: 'Reactions' })
    await userEvent.click(button)
  }
}

export default ReactionsStory
