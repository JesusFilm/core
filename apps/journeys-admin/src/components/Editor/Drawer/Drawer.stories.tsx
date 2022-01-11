import { Story, Meta } from '@storybook/react'
import Box from '@mui/material/Box'
import { journeysAdminConfig } from '../../../libs/storybook'
import { EditorProvider } from '../Context'
import { Drawer } from '.'

const DrawerStory = {
  ...journeysAdminConfig,
  component: Drawer,
  title: 'Journeys-Admin/Editor/Drawer'
}

const Template: Story = () => (
  <EditorProvider
    initialState={{
      drawerTitle: 'Social Share Appearance',
      drawerChildren: <Box m={6}>Hello World</Box>,
      drawerMobileOpen: true
    }}
  >
    <Drawer />
  </EditorProvider>
)

export const Default = Template.bind({})

export default DrawerStory as Meta
