import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Meta, Story } from '@storybook/react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import { simpleComponentConfig } from '../../../../../../libs/storybook'
import { steps } from '../data'

import { EmailAction } from '.'

const EmailActionStory = {
  ...simpleComponentConfig,
  component: EmailAction,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Action/ActionStates'
}

export const Email: Story = () => {
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

export default EmailActionStory as Meta
