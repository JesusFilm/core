import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps, ReactElement, useState } from 'react'

import { journeysAdminConfig } from '../../../../../libs/storybook'

import { Drawer } from '.'

const DrawerStory: Meta<typeof Drawer> = {
  ...journeysAdminConfig,
  component: Drawer,
  title: 'Journeys-Admin/Editor/Slider/Settings/Drawer'
}

const DrawerComponent = (args): ReactElement => {
  const [open, setOpen] = useState(true)

  return <Drawer open={open} onClose={() => setOpen(false)} {...args} />
}

const Template: StoryObj<ComponentProps<typeof Drawer>> = {
  render: ({ ...args }) => <DrawerComponent {...args} />
}

export const Default = {
  ...Template
}

export default DrawerStory
