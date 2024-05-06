import { Meta, StoryObj } from '@storybook/react'
import { screen, userEvent } from '@storybook/testing-library'
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

export const ClosedListGroup = {
  ...Template,
  args: { selectedPage: '' },
  play: async () => {
    const listGroup = screen.getByRole('button', { name: 'Youtube' })
    await userEvent.click(listGroup)
  }
}

export const ClosedDrawer = {
  ...Template,
  args: { selectedPage: '' },
  play: async () => {
    const toggleDrawerButton = screen.getByTestId('NavigationListItemToggle')
    await userEvent.click(toggleDrawerButton)
  }
}

export default NavigationDrawerStory
