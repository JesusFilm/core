import Box from '@mui/material/Box'
import { Meta, Story } from '@storybook/react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import { journeysAdminConfig } from '../../../libs/storybook'

import { Drawer } from '.'

const DrawerStory = {
  ...journeysAdminConfig,
  component: Drawer,
  title: 'Journeys-Admin/Editor/Drawer'
}

const Template: Story = () => (
  <EditorProvider
    initialState={{
      drawerTitle: 'Social Share Preview',
      drawerChildren: <Box m={6}>Hello World</Box>,
      drawerMobileOpen: true
    }}
  >
    <Drawer />
  </EditorProvider>
)

export const Default = Template.bind({})

export default DrawerStory as Meta
