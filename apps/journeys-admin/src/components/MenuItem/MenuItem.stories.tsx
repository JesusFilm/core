import { Meta, StoryObj } from '@storybook/react'

import EyeOpen from '@core/shared/ui/icons/EyeOpen'

import { simpleComponentConfig } from '../../libs/storybook'

import { MenuItem } from './MenuItem'

const MenuItemStory: Meta<typeof MenuItem> = {
  ...simpleComponentConfig,
  component: MenuItem,
  title: 'Journeys-Admin/MenuItem'
}

const Template: StoryObj<typeof MenuItem> = {
  render: ({ ...args }) => (
    <MenuItem label={args.label} icon={args.icon} disabled={args.disabled} />
  )
}

export const Default = {
  ...Template,
  args: {
    label: 'Preview',
    icon: <EyeOpen />
  }
}

export const Disabled = {
  ...Template,
  args: {
    label: 'Preview',
    icon: <EyeOpen />,
    disabled: true
  }
}

export default MenuItemStory
