import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { simpleComponentConfig } from '../../../../../../libs/storybook'
import { steps } from '../data'
import { EmailAction } from './EmailAction'

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
