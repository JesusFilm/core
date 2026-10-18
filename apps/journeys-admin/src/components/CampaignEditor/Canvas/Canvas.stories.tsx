import { Meta, StoryObj } from '@storybook/nextjs-vite'
import { SnackbarProvider } from 'notistack'
import { ReactElement } from 'react'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { GetCampaign_campaign as Campaign } from '../../../../__generated__/GetCampaign'
import {
  CampaignJourneyListDisplay,
  CampaignPageKind,
  CampaignSwitcherVariant
} from '../../../../__generated__/globalTypes'
import { campaign, campaignWithRegions } from '../data'
import { QueriedEditor } from '../testing'

import { Canvas } from './Canvas'

const JOURNEY_LIST_ID = 'landingJourneyListId'
const SWITCHER_ID = 'landingSwitcherId'
const ANALYTICS_ID = 'landingAnalyticsId'

const landingPageId = campaign.pages.find(
  (page) => page.kind === CampaignPageKind.landing
)?.id

/** The landing page reduced to one section, with the block's own fields patched. */
function onlySection(
  blockId: string,
  patch: Record<string, unknown> = {},
  keepChildren = false,
  base: Campaign = campaign
): Campaign {
  return {
    ...base,
    blocks: base.blocks
      .filter(
        (block) =>
          block.pageId !== landingPageId ||
          block.id === blockId ||
          (keepChildren && block.parentBlockId === blockId)
      )
      .map((block) =>
        block.id === blockId ? ({ ...block, ...patch } as typeof block) : block
      )
  }
}

interface CanvasStoryProps {
  campaignData: Campaign
  selectedBlockId: string
}

function CanvasStory({
  campaignData,
  selectedBlockId
}: CanvasStoryProps): ReactElement {
  return (
    <SnackbarProvider>
      <QueriedEditor
        campaignData={campaignData}
        initialState={{ selectedBlockId }}
      >
        <Canvas
          campaign={campaignData}
          pageKind={CampaignPageKind.landing}
          view="desktop"
        />
      </QueriedEditor>
    </SnackbarProvider>
  )
}

const CanvasMeta: Meta<typeof CanvasStory> = {
  ...journeysAdminConfig,
  component: CanvasStory,
  title: 'Journeys-Admin/CampaignEditor/Canvas',
  parameters: { ...journeysAdminConfig.parameters, layout: 'fullscreen' }
}

type Story = StoryObj<typeof CanvasStory>

/** A selected Journey list with no live card lists its noJourneys string under "Campaign strings". */
export const JourneyListEmptyState: Story = {
  args: {
    campaignData: onlySection(JOURNEY_LIST_ID),
    selectedBlockId: JOURNEY_LIST_ID
  }
}

export const RegionSwitcherCards: Story = {
  args: {
    campaignData: onlySection(
      SWITCHER_ID,
      { switcherVariant: CampaignSwitcherVariant.cards },
      false,
      campaignWithRegions
    ),
    selectedBlockId: SWITCHER_ID
  }
}

export const RegionSwitcherList: Story = {
  args: {
    campaignData: onlySection(
      SWITCHER_ID,
      { switcherVariant: CampaignSwitcherVariant.list },
      false,
      campaignWithRegions
    ),
    selectedBlockId: SWITCHER_ID
  }
}

export const RegionSwitcherPills: Story = {
  args: {
    campaignData: onlySection(
      SWITCHER_ID,
      { switcherVariant: CampaignSwitcherVariant.pills },
      false,
      campaignWithRegions
    ),
    selectedBlockId: SWITCHER_ID
  }
}

export const JourneyListGrid: Story = {
  args: {
    campaignData: onlySection(
      JOURNEY_LIST_ID,
      { display: CampaignJourneyListDisplay.grid },
      true
    ),
    selectedBlockId: JOURNEY_LIST_ID
  }
}

export const JourneyListList: Story = {
  args: {
    campaignData: onlySection(
      JOURNEY_LIST_ID,
      { display: CampaignJourneyListDisplay.list },
      true
    ),
    selectedBlockId: JOURNEY_LIST_ID
  }
}

export const AnalyticsMapOn: Story = {
  args: {
    campaignData: onlySection(ANALYTICS_ID, { showMap: true }),
    selectedBlockId: ANALYTICS_ID
  }
}

export const AnalyticsMapOff: Story = {
  args: {
    campaignData: onlySection(ANALYTICS_ID, { showMap: false }),
    selectedBlockId: ANALYTICS_ID
  }
}

export default CanvasMeta
