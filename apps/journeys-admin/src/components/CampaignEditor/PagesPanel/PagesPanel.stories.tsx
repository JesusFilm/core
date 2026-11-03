import { MockedProvider } from '@apollo/client/testing/react'
import Paper from '@mui/material/Paper'
import { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ReactElement } from 'react'

import { CommandProvider } from '@core/journeys/ui/CommandProvider'
import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { GetCampaign_campaign as Campaign } from '../../../../__generated__/GetCampaign'
import { CampaignPageKind } from '../../../../__generated__/globalTypes'
import {
  CampaignEditorProvider,
  CampaignEditorState
} from '../CampaignEditorProvider'
import { campaign, campaignWithRegions } from '../data'
import { LEFT_PANEL_WIDTH } from '../LeftPanel'

import { PagesPanel } from '.'

interface PagesPanelStoryProps {
  initialState?: Partial<CampaignEditorState>
  campaignProp?: Campaign
}

/** The Pages panel in its 300 px column. */
function PagesPanelStory({
  initialState,
  campaignProp = campaign
}: PagesPanelStoryProps): ReactElement {
  return (
    <MockedProvider>
      <CommandProvider>
        <CampaignEditorProvider
          campaign={campaignProp}
          initialState={initialState}
        >
          <Paper
            square
            sx={{ width: LEFT_PANEL_WIDTH, height: 480, overflow: 'auto' }}
          >
            <PagesPanel />
          </Paper>
        </CampaignEditorProvider>
      </CommandProvider>
    </MockedProvider>
  )
}

const PagesPanelMeta: Meta<typeof PagesPanelStory> = {
  ...journeysAdminConfig,
  component: PagesPanelStory,
  title: 'Journeys-Admin/CampaignEditor/PagesPanel',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'centered'
  }
}

type Story = StoryObj<typeof PagesPanelStory>

/** A campaign with no regions: the landing page and the Region Page. */
export const Landing: Story = {}

/** Two regions, one unlisted, both still needing a journey. */
export const WithRegions: Story = {
  args: {
    campaignProp: campaignWithRegions,
    initialState: {
      pageKind: CampaignPageKind.regionTemplate,
      regionId: 'afrRegionId'
    }
  }
}

/** A region with a very long name and the Needs journey chip: the name wraps inside the padding and the chip keeps its size. */
export const LongRegionName: Story = {
  args: {
    campaignProp: {
      ...campaignWithRegions,
      regions: campaignWithRegions.regions.map((region, index) =>
        index === 0
          ? {
              ...region,
              name: 'Central and Eastern Europe, the Caucasus and Central Asia'
            }
          : region
      )
    }
  }
}

export default PagesPanelMeta
