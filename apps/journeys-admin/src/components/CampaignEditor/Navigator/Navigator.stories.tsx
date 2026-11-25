import { MockedProvider } from '@apollo/client/testing/react'
import Paper from '@mui/material/Paper'
import { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ReactElement } from 'react'
import { screen, userEvent } from 'storybook/test'

import { CommandProvider } from '@core/journeys/ui/CommandProvider'
import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { GetCampaign_campaign as Campaign } from '../../../../__generated__/GetCampaign'
import { CampaignPageKind } from '../../../../__generated__/globalTypes'
import {
  CampaignEditorProvider,
  CampaignEditorState
} from '../CampaignEditorProvider'
import { CampaignHoverProvider } from '../CampaignHoverProvider'
import { campaignWithColumns, campaignWithRegions } from '../data'
import { LEFT_PANEL_WIDTH } from '../LeftPanel'
import { CampaignCommandProvider } from '../utils/useCampaignCommand'

import { Navigator } from '.'

interface NavigatorStoryProps {
  initialState?: Partial<CampaignEditorState>
  campaignProp?: Campaign
}

/** The Navigator in its 300 px column. */
function NavigatorStory({
  initialState,
  campaignProp = campaignWithRegions
}: NavigatorStoryProps): ReactElement {
  return (
    <MockedProvider>
      <CommandProvider>
        <CampaignEditorProvider
          campaign={campaignProp}
          initialState={initialState}
        >
          <CampaignCommandProvider>
            <CampaignHoverProvider>
              <Paper
                square
                sx={{
                  width: LEFT_PANEL_WIDTH,
                  height: 520,
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <Navigator />
              </Paper>
            </CampaignHoverProvider>
          </CampaignCommandProvider>
        </CampaignEditorProvider>
      </CommandProvider>
    </MockedProvider>
  )
}

const NavigatorMeta: Meta<typeof NavigatorStory> = {
  ...journeysAdminConfig,
  component: NavigatorStory,
  title: 'Journeys-Admin/CampaignEditor/Navigator',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'centered'
  }
}

type Story = StoryObj<typeof NavigatorStory>

/** The landing page: header, sections, footer, one level showing. */
export const LandingPage: Story = {}

/** A region line selected: the switcher and its region card expand, showing the Needs journey and not-listed badges. */
export const LandingPageWithRegions: Story = {
  args: { initialState: { selectedBlockId: 'eurLineId' } }
}

/** A Column Slot's section selected: Columns and the slot expand. */
export const ColumnsExpanded: Story = {
  args: {
    campaignProp: campaignWithColumns,
    initialState: { selectedBlockId: 'slotRichTextId' }
  }
}

/** The Region Page rendered for Europe, the other region's card selected: its own sections, with Africa (unlisted) in the switcher. */
export const RegionPage: Story = {
  args: {
    initialState: {
      pageKind: CampaignPageKind.regionTemplate,
      regionId: 'eurRegionId',
      selectedBlockId: 'regionSwitcherId',
      selectedRegionId: 'afrRegionId'
    }
  }
}

/** The nested, unlisted Region row that needs a journey: the label truncates so the badges and the drag handle stay inside the 300 px column. */
export const NestedRegionRowWithBadges: Story = {
  args: { initialState: { selectedBlockId: 'eurLineId' } }
}

/** Lifts a row by its handle with the keyboard and steps it once, so the row it would land on is marked. */
async function liftAndStep(handleId: string): Promise<void> {
  const handle = await screen.findByTestId(`NavigatorDragHandle-${handleId}`)
  handle.focus()
  await userEvent.keyboard(' ')
  await userEvent.keyboard('{ArrowUp}')
}

/** The second journey card lifted over the first: only the list's own cards can be landed on. */
export const DraggingAJourneyCard: Story = {
  args: { initialState: { selectedBlockId: 'landingDraftJourneyId' } },
  play: async () => await liftAndStep('landingDraftJourneyId')
}

/** An Extra lifted: the divider is a drop target, and dropping past it flips the Extra's placement. */
export const DraggingAnExtraTowardTheDivider: Story = {
  args: { initialState: { selectedBlockId: 'heroButtonId' } },
  play: async () => await liftAndStep('heroButtonId')
}

export default NavigatorMeta
