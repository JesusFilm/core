import { Meta, StoryObj } from '@storybook/nextjs-vite'
import { SnackbarProvider } from 'notistack'
import { ReactElement } from 'react'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { CampaignPageKind } from '../../../../__generated__/globalTypes'
import { campaign } from '../data'
import { QueriedEditor } from '../testing'

import { Canvas } from './Canvas'

const JOURNEY_LIST_ID = 'landingJourneyListId'

const landingPageId = campaign.pages.find(
  (page) => page.kind === CampaignPageKind.landing
)?.id

/** The landing page reduced to its Journey list, with no journey card behind it. */
const emptyJourneyListCampaign = {
  ...campaign,
  blocks: campaign.blocks.filter(
    (block) => block.pageId !== landingPageId || block.id === JOURNEY_LIST_ID
  )
}

function CanvasStory(): ReactElement {
  return (
    <SnackbarProvider>
      <QueriedEditor
        campaignData={emptyJourneyListCampaign}
        initialState={{ selectedBlockId: JOURNEY_LIST_ID }}
      >
        <Canvas
          campaign={emptyJourneyListCampaign}
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
export const JourneyListEmptyState: Story = {}

export default CanvasMeta
