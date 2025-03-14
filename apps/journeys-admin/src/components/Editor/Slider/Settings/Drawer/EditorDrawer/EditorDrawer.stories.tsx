import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { Meta, StoryObj } from '@storybook/react'
import noop from 'lodash/noop'

import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { EditorDrawer } from './EditorDrawer'

const EditorDrawerStory: Meta<typeof EditorDrawer> = {
  ...simpleComponentConfig,
  title: 'Journeys-Admin/Editor/Slider/Settings/Drawer/EditorDrawer',
  component: EditorDrawer,
  parameters: {
    layout: 'centered'
  }
}

const Template: StoryObj<typeof EditorDrawer> = {
  render: (args) => <EditorDrawer {...args} />
}

export const Default = {
  ...Template,
  args: {
    children: (
      <Box sx={{ p: 4 }}>
        <Typography>Drawer Content</Typography>
      </Box>
    )
  }
}

export const WithLongContent = {
  ...Template,
  args: {
    title: 'Settings',
    onClose: noop,
    children: (
      <Box sx={{ p: 4 }}>
        {Array.from({ length: 20 }).map((_, index) => (
          <Typography key={index}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in
            dui mauris.
          </Typography>
        ))}
      </Box>
    )
  }
}

export default EditorDrawerStory
