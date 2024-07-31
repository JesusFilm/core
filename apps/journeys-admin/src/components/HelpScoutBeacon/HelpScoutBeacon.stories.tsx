import { simpleComponentConfig } from '@core/shared/ui/storybook'
import { Meta, StoryObj } from '@storybook/react'
import { ComponentPropsWithRef } from 'react'
import { HelpScoutBeacon } from './HelpScoutBeacon'

const HelpScoutBeaconStory: Meta<typeof HelpScoutBeacon> = {
  ...simpleComponentConfig,
  title: 'Journeys-Admin/HelpScoutBeacon'
}

const Template: StoryObj<ComponentPropsWithRef<typeof HelpScoutBeacon>> = {
  render: ({ ...args }) => {
    return <HelpScoutBeacon {...args} />
  }
}

export const Default = {
  ...Template,
  args: {
    userName: 'user name',
    userEmail: 'user email'
  }
}

export const IconSecondary = {
  ...Template,
  args: {
    iconButtonColor: 'secondary',
    userName: 'user name',
    userEmail: 'user email'
  }
}

export const MenuItem = {
  ...Template,
  args: {
    variant: 'menuItem',
    userName: 'user name',
    userEmail: 'user email'
  }
}

export default HelpScoutBeaconStory
