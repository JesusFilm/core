import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps, ReactElement, useState } from 'react'

import { nexusAdminConfig } from '../../../libs/storybook'

import { NavigationDrawer } from './NavigationDrawer'

const NavigationDrawerStory: Meta<typeof NavigationDrawer> = {
  ...nexusAdminConfig,
  component: NavigationDrawer,
  title: 'Nexus-Admin/NavigationDrawer',
  parameters: {
    layout: 'fullscreen'
  }
}

function NavigationDrawerComponent(
  props: ComponentProps<typeof NavigationDrawer>
): ReactElement {
  const [open, setOpen] = useState(true)
  return <NavigationDrawer open={open} onClose={setOpen} {...props} />
}

const Template: StoryObj<typeof NavigationDrawer> = {
  render: ({ ...args }) => {
    return <NavigationDrawerComponent {...args} />
  }
}

export const Default = { ...Template, args: { selectedPage: '' } }

export default NavigationDrawerStory
