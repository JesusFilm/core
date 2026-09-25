import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/nextjs-vite'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { makeItems } from '../PublicGalleryPage/publicGalleryPageData.mock'

import { PublicCampaignPage } from './PublicCampaignPage'
import { makeCampaignData } from './publicCampaignPageData.mock'

/**
 * The public campaign landing page, shared by the live journeys app and the
 * admin campaign builder preview. `variant="journey"` renders the real page;
 * `variant="admin"` renders the compact, read-only recreation.
 */
const meta: Meta<typeof PublicCampaignPage> = {
  ...journeysAdminConfig,
  component: PublicCampaignPage,
  title: 'Journeys-Ui/PublicCampaignPage',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const campaign = makeCampaignData({
  backgroundImageSrc:
    'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=1600&q=80',
  templates: makeItems(4)
})

type Story = StoryObj<typeof PublicCampaignPage>

export const Journey: Story = {
  args: { variant: 'journey', data: campaign }
}

export const Empty: Story = {
  args: {
    variant: 'journey',
    data: makeCampaignData({
      shareJourneys: [],
      templates: [],
      countryStats: { totalVisitors: 0, countries: [] }
    })
  }
}

export const StatsUnavailable: Story = {
  args: { variant: 'journey', data: makeCampaignData({ countryStats: null }) }
}

/** Compact recreation, rendered inside a builder-preview-sized frame. */
export const Admin: Story = {
  args: { variant: 'admin', data: campaign },
  render: (args) => (
    <Box sx={{ width: 360 }}>
      <PublicCampaignPage {...args} />
    </Box>
  )
}

export default meta
