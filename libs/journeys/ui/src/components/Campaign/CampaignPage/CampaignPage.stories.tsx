import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ComponentProps } from 'react'

import {
  CampaignPageKind,
  CampaignStringKey
} from '../../../../__generated__/globalTypes'
import { campaignStoryConfig } from '../campaignStories'
import { afrRegion, campaignPublic, eurRegion } from '../testData'

import { CampaignPage } from './CampaignPage'

const meta: Meta<typeof CampaignPage> = {
  ...campaignStoryConfig(),
  component: CampaignPage,
  title: 'Journeys-Ui/Campaign/CampaignPage'
}

type Story = StoryObj<ComponentProps<typeof CampaignPage>>

export const Landing: Story = {
  args: { campaign: campaignPublic, pageKind: CampaignPageKind.landing }
}

export const RegionPage: Story = {
  args: {
    campaign: campaignPublic,
    pageKind: CampaignPageKind.regionTemplate,
    region: eurRegion
  }
}

/** The only listed region's own page: its switcher would show nothing, so the band is skipped. */
export const OneListedRegion: Story = {
  args: {
    campaign: {
      ...campaignPublic,
      regions: [eurRegion, { ...afrRegion, listed: false }]
    },
    pageKind: CampaignPageKind.regionTemplate,
    region: eurRegion
  }
}

const BLANKED_STRINGS: readonly CampaignStringKey[] = [
  CampaignStringKey.allRegions,
  CampaignStringKey.openTemplate,
  CampaignStringKey.seeAllOnWatch
]

/** "All regions", "Open" and "See all" emptied by the author: blank labels, the default kept as each control's accessible name. */
export const BlankStrings: Story = {
  args: {
    campaign: {
      ...campaignPublic,
      strings: campaignPublic.strings.map((string) =>
        BLANKED_STRINGS.includes(string.key) ? { ...string, value: '' } : string
      )
    },
    pageKind: CampaignPageKind.regionTemplate,
    region: eurRegion
  }
}

export default meta
