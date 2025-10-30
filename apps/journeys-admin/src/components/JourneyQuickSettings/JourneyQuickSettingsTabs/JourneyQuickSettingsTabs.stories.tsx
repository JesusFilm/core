import { Meta, StoryObj } from '@storybook/nextjs'
import { ComponentProps, useState } from 'react'

import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { JourneyQuickSettingsTabs } from './JourneyQuickSettingsTabs'

const JourneyQuickSettingsTabsStory: Meta<typeof JourneyQuickSettingsTabs> = {
  ...simpleComponentConfig,
  component: JourneyQuickSettingsTabs,
  title: 'Journeys-Admin/JourneyQuickSettings/JourneyQuickSettingsTabs'
}

const Template: StoryObj<ComponentProps<typeof JourneyQuickSettingsTabs>> = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
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
