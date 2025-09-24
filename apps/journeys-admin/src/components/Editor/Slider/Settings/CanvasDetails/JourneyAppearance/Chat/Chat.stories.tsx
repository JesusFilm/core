import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/nextjs'
import { screen, userEvent } from 'storybook/test'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { DRAWER_WIDTH } from '../../../../../constants'

import { Chat } from '.'

const ChatStory: Meta<typeof Chat> = {
  ...simpleComponentConfig,
  component: Chat,
  title:
    'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/JourneyAppearance/Chat'
}

const Template: StoryObj<typeof Chat> = {
  render: () => (
    <MockedProvider>
      <EditorProvider>
        <Box sx={{ width: DRAWER_WIDTH }}>
          <Chat />
        </Box>
      </EditorProvider>
    </MockedProvider>
  )
}

export const Default = { ...Template }

export const Open = {
  ...Template,
  play: async () => {
    const button = screen.getByRole('button', { name: 'Chat Widget' })
    await userEvent.click(button)
  }
}

export default ChatStory
