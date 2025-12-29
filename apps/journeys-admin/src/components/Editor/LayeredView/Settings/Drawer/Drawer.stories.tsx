import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Meta, StoryObj } from '@storybook/nextjs'
import { ComponentProps } from 'react'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { Drawer } from '.'

const DrawerStory: Meta<typeof Drawer> = {
  ...journeysAdminConfig,
  component: Drawer,
  title: 'Journeys-Admin/Editor/Slider/Settings/Drawer'
}

const Template: StoryObj<ComponentProps<typeof Drawer>> = {
  render: ({ ...args }) => (
    <Drawer {...args}>
      <Stack justifyContent="center" alignItems="center" height="100%">
        <Stack direction="row" justifyContent="center" alignItems="center">
          <Typography variant="body1" p="2">
            Drawer Content
          </Typography>
        </Stack>
      </Stack>
    </Drawer>
  )
}

export const Default = {
  ...Template,
  args: {
    title: 'Drawer Title'
  }
}

export default DrawerStory
