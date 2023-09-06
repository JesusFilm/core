import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import { journeysAdminConfig } from '../../../libs/storybook'

import { Drawer } from '.'

const DrawerStory: Meta<typeof Drawer> = {
  ...journeysAdminConfig,
  component: Drawer,
  title: 'Journeys-Admin/Editor/Drawer'
}

const Template: StoryObj<typeof Drawer> = {
  render: () => (
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
}
export const Default = { ...Template }

export default DrawerStory
