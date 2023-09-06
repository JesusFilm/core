import { Meta, Story } from '@storybook/react'

import EyeOpen from '@core/shared/ui/icons/EyeOpen'

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
  icon: <EyeOpen />
}

export const Disabled = Template.bind({})
Disabled.args = {
  label: 'Preview',
  icon: <EyeOpen />,
  disabled: true
}

export default MenuItemStory as Meta
