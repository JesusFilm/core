import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Meta, StoryObj } from '@storybook/nextjs'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { steps } from '../data'

import { ChatAction } from '.'

const ChatActionStory: Meta<typeof ChatAction> = {
  ...simpleComponentConfig,
  component: ChatAction,
  title:
    'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/Properties/controls/Action/ActionStates'
}

export const Chat: StoryObj<typeof ChatAction> = {
  render: () => {
    const selectedBlock = {
      ...steps[1].children[0].children[3],
      action: {
        parentBlockId: 'button2.id',
        __typename: 'ChatAction' as const,
        gtmEventName: 'gtmEventName',
        chatUrl: 'https://chat.example.com',
        customizable: false,
        parentStepId: null
      }
    }

    return (
      <Stack spacing={10}>
        <Box>
          <Typography>Default</Typography>
          <MockedProvider>
            <ChatAction />
          </MockedProvider>
        </Box>

        <Box>
          <Typography>With Chat URL</Typography>
          <MockedProvider>
            <EditorProvider initialState={{ selectedBlock }}>
              <ChatAction />
            </EditorProvider>
          </MockedProvider>
        </Box>
      </Stack>
    )
  }
}

export default ChatActionStory
