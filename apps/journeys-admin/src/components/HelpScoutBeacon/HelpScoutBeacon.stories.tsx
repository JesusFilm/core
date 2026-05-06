import { Meta, StoryObj } from '@storybook/nextjs'
import { ComponentPropsWithRef } from 'react'

import { simpleComponentConfig } from '@core/shared/ui/storybook'

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
  args: {}
}

export const IconSecondary = {
  ...Template,
  args: {
    iconButtonColor: 'secondary'
  }
}

export const MenuItem = {
  ...Template,
  args: {
    variant: 'menuItem'
  }
}

export default HelpScoutBeaconStory
