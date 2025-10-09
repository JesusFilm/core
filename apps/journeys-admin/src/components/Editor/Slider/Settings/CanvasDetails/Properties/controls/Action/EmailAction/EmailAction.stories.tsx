import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Meta, StoryObj } from '@storybook/nextjs'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { steps } from '../data'

import { EmailAction } from '.'

const EmailActionStory: Meta<typeof EmailAction> = {
  ...simpleComponentConfig,
  component: EmailAction,
  title:
    'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/Properties/controls/Action/ActionStates'
}

export const Email: StoryObj<typeof EmailAction> = {
  render: () => {
    const selectedBlock = steps[1].children[0].children[4]

    return (
      <Stack spacing={10}>
        <Box>
          <Typography>Default</Typography>
          <MockedProvider>
            <EmailAction />
          </MockedProvider>
        </Box>

        <Box>
          <Typography>With Email</Typography>
          <MockedProvider>
            <EditorProvider initialState={{ selectedBlock }}>
              <EmailAction />
            </EditorProvider>
          </MockedProvider>
        </Box>
      </Stack>
    )
  }
}

export default EmailActionStory
