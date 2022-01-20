import { Meta, Story } from '@storybook/react'
import IconButton from '@mui/material/IconButton'
import MenuRounded from '@mui/icons-material/MenuRounded'
import { journeysAdminConfig } from '../../libs/storybook'
import { AppBarProps } from './AppBar'
import { AppBar } from '.'

const AppBarStory = {
  ...journeysAdminConfig,
  component: AppBar,
  title: 'Journeys-Admin/AppBar',
  parameters: {
    layout: 'fullscreen'
  }
}

const Template: Story<AppBarProps> = ({ ...args }) => <AppBar {...args} />

export const Default = Template.bind({})
Default.args = { title: 'Journeys' }

export const Complete = Template.bind({})
Complete.args = {
  backHref: '/',
  showDrawer: true,
  title: 'Journey Details',
  Menu: (
    <IconButton edge="end" size="large" color="inherit" sx={{ ml: 2 }}>
      <MenuRounded />
    </IconButton>
  )
}

export default AppBarStory as Meta
