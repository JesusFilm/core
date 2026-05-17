import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/nextjs-vite'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { TemplateInfoPanel } from './TemplateInfoPanel'

const TemplateInfoPanelStory: Meta<typeof TemplateInfoPanel> = {
  ...journeysAdminConfig,
  component: TemplateInfoPanel,
  title: 'Journeys-Admin/TemplateInfoPanel',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'centered'
  },
  decorators: [
    (Story) => (
      <Box sx={{ width: 375, p: 2, bgcolor: '#F4F5F7' }}>
        <Story />
      </Box>
    )
  ]
}

export const AllCollapsed: StoryObj<typeof TemplateInfoPanel> = {
  render: () => <TemplateInfoPanel />
}

export const TemplateTypesExpanded: StoryObj<typeof TemplateInfoPanel> = {
  render: () => <TemplateInfoPanel defaultExpanded="templateTypes" />
}

export const HowToCreateExpanded: StoryObj<typeof TemplateInfoPanel> = {
  render: () => <TemplateInfoPanel defaultExpanded="howToCreate" />
}

export const TrackingAndAnalyticsExpanded: StoryObj<typeof TemplateInfoPanel> =
  {
    render: () => <TemplateInfoPanel defaultExpanded="trackingAndAnalytics" />
  }

export const SharingAndPublishingExpanded: StoryObj<typeof TemplateInfoPanel> =
  {
    render: () => <TemplateInfoPanel defaultExpanded="sharingAndPublishing" />
  }

export default TemplateInfoPanelStory
