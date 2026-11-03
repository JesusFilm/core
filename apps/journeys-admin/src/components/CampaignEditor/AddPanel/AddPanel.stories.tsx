import { MockedProvider } from '@apollo/client/testing/react'
import Paper from '@mui/material/Paper'
import { Meta, StoryObj } from '@storybook/nextjs-vite'
import { SnackbarProvider } from 'notistack'
import { ReactElement } from 'react'

import { CommandProvider } from '@core/journeys/ui/CommandProvider'
import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { GetCampaign_campaign as Campaign } from '../../../../__generated__/GetCampaign'
import { CampaignPageKind } from '../../../../__generated__/globalTypes'
import {
  CampaignEditorProvider,
  CampaignEditorState
} from '../CampaignEditorProvider'
import { campaign, campaignWithColumns, campaignWithRegions } from '../data'
import { LEFT_PANEL_WIDTH } from '../LeftPanel'

import { AddPanel } from '.'

interface AddPanelStoryProps {
  initialState?: Partial<CampaignEditorState>
  campaignProp?: Campaign
}

/** The Add panel in its 300 px column. */
function AddPanelStory({
  initialState,
  campaignProp = campaign
}: AddPanelStoryProps): ReactElement {
  return (
    <MockedProvider>
      <SnackbarProvider>
        <CommandProvider>
          <CampaignEditorProvider
            campaign={campaignProp}
            initialState={initialState}
          >
            <Paper
              square
              sx={{ width: LEFT_PANEL_WIDTH, height: 640, overflow: 'auto' }}
            >
              <AddPanel />
            </Paper>
          </CampaignEditorProvider>
        </CommandProvider>
      </SnackbarProvider>
    </MockedProvider>
  )
}

const AddPanelMeta: Meta<typeof AddPanelStory> = {
  ...journeysAdminConfig,
  component: AddPanelStory,
  title: 'Journeys-Admin/CampaignEditor/AddPanel',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'centered'
  }
}

type Story = StoryObj<typeof AddPanelStory>

/** Nothing selected: sections go to the end of the page; Extras need a section. */
export const NothingSelected: Story = {}

/** On the Region Page nothing selected also offers the region-only sections. */
export const RegionPage: Story = {
  args: { initialState: { pageKind: CampaignPageKind.regionTemplate } }
}

/** A section selected: a section goes below it, an Extra into it above or below its text. */
export const SectionSelected: Story = {
  args: { initialState: { selectedBlockId: 'heroId' } }
}

/** An Extra selected: another Extra on the same host and placement. */
export const ExtraSelected: Story = {
  args: { initialState: { selectedBlockId: 'heroButtonId' } }
}

/** An empty Column Slot selected: only the section types that fit a column. */
export const EmptyColumnSlotSelected: Story = {
  args: {
    campaignProp: campaignWithColumns,
    initialState: { selectedBlockId: 'slotRightId' }
  }
}

/** A region card selected: the Region group's Add line. */
export const RegionCardSelected: Story = {
  args: {
    campaignProp: campaignWithRegions,
    initialState: {
      selectedRegionId: 'eurRegionId',
      selectedBlockId: 'landingSwitcherId'
    }
  }
}

export default AddPanelMeta
