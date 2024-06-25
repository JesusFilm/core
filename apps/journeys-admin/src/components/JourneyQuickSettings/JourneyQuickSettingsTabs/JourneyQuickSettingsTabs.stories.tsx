import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps, useState } from 'react'

import { simpleComponentConfig } from '../../../libs/storybook'

import { JourneyQuickSettingsTabs } from './JourneyQuickSettingsTabs'

const JourneyQuickSettingsTabsStory: Meta<typeof JourneyQuickSettingsTabs> = {
  ...simpleComponentConfig,
  component: JourneyQuickSettingsTabs,
  title: 'Journeys-Admin/JourneyQuickSettings/JourneyQuickSettingsTabs'
}

const Template: StoryObj<ComponentProps<typeof JourneyQuickSettingsTabs>> = {
  render: () => {
    const [tabValue, setTabValue] = useState(0)
    return (
      <JourneyQuickSettingsTabs tabValue={tabValue} setTabValue={setTabValue} />
    )
  }
}

export const Default = {
  ...Template
}

export default JourneyQuickSettingsTabsStory
