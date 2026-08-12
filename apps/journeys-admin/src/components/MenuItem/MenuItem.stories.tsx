import MenuList from '@mui/material/MenuList'
import { Meta, StoryObj } from '@storybook/nextjs-vite'

import EyeOpenIcon from '@core/shared/ui/icons/EyeOpen'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { MenuItem } from './MenuItem'

const MenuItemStory: Meta<typeof MenuItem> = {
  ...simpleComponentConfig,
  component: MenuItem,
  title: 'Journeys-Admin/MenuItem'
}

const Template: StoryObj<typeof MenuItem> = {
  render: ({ ...args }) => (
    <MenuList>
      <MenuItem label={args.label} icon={args.icon} disabled={args.disabled} />
    </MenuList>
  )
}

export const Default = {
  ...Template,
  args: {
    label: 'Preview',
    icon: <EyeOpenIcon />
  }
}

export const Disabled = {
  ...Template,
  args: {
    label: 'Preview',
    icon: <EyeOpenIcon />,
    disabled: true
  }
}

export default MenuItemStory
