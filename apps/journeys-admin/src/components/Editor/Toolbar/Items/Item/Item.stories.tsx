import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import BarChartSquare3Icon from '@core/shared/ui/icons/BarChartSquare3'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { Item } from './Item'

const Demo: Meta<typeof Item> = {
  ...simpleComponentConfig,
  component: Item,
  title: 'Journeys-Admin/Editor/Toolbar/Items/Item'
}

const Template: StoryObj<ComponentProps<typeof Item>> = {
  render: (itemProps) => {
    return <Item {...itemProps} />
  }
}

export const MenuItem = {
  ...Template,
  args: {
    variant: 'menu-item',
    icon: <BarChartSquare3Icon />,
    label: 'Menu Item'
  }
}

export const ButtonItem = {
  ...Template,
  args: {
    variant: 'button',
    icon: <BarChartSquare3Icon />,
    label: 'Button Item'
  }
}

export const IconButtonItem = {
  ...Template,
  args: {
    variant: 'icon-button',
    icon: <BarChartSquare3Icon />,
    label: 'Icon Button Item'
  }
}

export default Demo
