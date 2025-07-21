import { Meta, StoryObj } from '@storybook/nextjs'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { GrowthSpacesSettings } from '.'

const Demo: Meta<typeof GrowthSpacesSettings> = {
  ...journeysAdminConfig,
  component: GrowthSpacesSettings,
  title: 'Journeys-Admin/GrowthSpacesSettings'
}

const Template: StoryObj = {
  render: () => {
    return <GrowthSpacesSettings />
  }
}

export const Default = {
  ...Template
}

export default Demo
