import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Meta, Story } from '@storybook/react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import { simpleComponentConfig } from '../../../../../../libs/storybook'
import { steps } from '../data'

import { LinkAction } from '.'

const LinkActionStory = {
  ...simpleComponentConfig,
  component: LinkAction,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Action/ActionStates'
}

export const Link: Story = () => {
  const selectedBlock = steps[1].children[0].children[3]

  return (
    <Stack spacing={10}>
      <Box>
        <Typography>Default</Typography>
        <MockedProvider>
          <LinkAction />
        </MockedProvider>
      </Box>

      <Box>
        <Typography>With Link</Typography>
        <MockedProvider>
          <EditorProvider initialState={{ selectedBlock }}>
            <LinkAction />
          </EditorProvider>
        </MockedProvider>
      </Box>
    </Stack>
  )
}

export default LinkActionStory as Meta
