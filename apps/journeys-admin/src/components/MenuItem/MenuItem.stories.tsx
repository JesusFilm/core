import VisibilityIcon from '@mui/icons-material/Visibility'
import { Meta, Story } from '@storybook/react'

import { simpleComponentConfig } from '../../libs/storybook'

import { MenuItem } from './MenuItem'

const MenuItemStory = {
  ...simpleComponentConfig,
  component: MenuItem,
  title: 'Journeys-Admin/MenuItem'
}

const Template: Story = ({ ...args }) => (
  <MenuItem label={args.label} icon={args.icon} disabled={args.disabled} />
)

export const Default = Template.bind({})
Default.args = {
  label: 'Preview',
  icon: <VisibilityIcon />
}

export const Disabled = Template.bind({})
Disabled.args = {
  label: 'Preview',
  icon: <VisibilityIcon />,
  disabled: true
}

export default MenuItemStory as Meta
