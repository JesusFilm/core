import { MockedProvider } from '@apollo/client/testing/react'
import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/nextjs-vite'
import { SnackbarProvider } from 'notistack'
import { ReactElement, useState } from 'react'

import { CommandProvider } from '@core/journeys/ui/CommandProvider'
import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { GetCampaign_campaign as Campaign } from '../../../../__generated__/GetCampaign'
import { CampaignAiTranslateMode } from '../../../../__generated__/globalTypes'
import {
  CampaignEditorProvider,
  CampaignEditorState
} from '../CampaignEditorProvider'
import type { CanvasView } from '../Canvas'
import { campaign, publishedCampaign } from '../data'
import { TranslationRunContext } from '../TranslationRunProvider'
import type { TranslationRun } from '../TranslationRunProvider'

import { LeftRail } from '.'

interface LeftRailStoryProps {
  initialState?: Partial<CampaignEditorState>
  campaignProp?: Campaign
  /** A machine-translation run in flight, ringed round the Localize button. */
  run?: TranslationRun
}

/** The Left Rail over a campaign fixture, in its 56 px column. */
function LeftRailStory({
  initialState,
  campaignProp = campaign,
  run
}: LeftRailStoryProps): ReactElement {
  const [view, setView] = useState<CanvasView>('desktop')
  return (
    <MockedProvider>
      <SnackbarProvider>
        <CommandProvider>
          <CampaignEditorProvider
            campaign={campaignProp}
            initialState={initialState}
          >
            <TranslationRunContext.Provider
              value={{
                run,
                start: () => undefined,
                cancel: () => undefined
              }}
            >
              <Box sx={{ display: 'flex', height: 560 }}>
                <LeftRail view={view} onViewChange={setView} />
              </Box>
            </TranslationRunContext.Provider>
          </CampaignEditorProvider>
        </CommandProvider>
      </SnackbarProvider>
    </MockedProvider>
  )
}

const LeftRailMeta: Meta<typeof LeftRailStory> = {
  ...journeysAdminConfig,
  component: LeftRailStory,
  title: 'Journeys-Admin/CampaignEditor/LeftRail',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'centered'
  }
}

type Story = StoryObj<typeof LeftRailStory>

/** A draft campaign: grey status dot, no panel open. */
export const Draft: Story = {}

/** A published campaign: green status dot. */
export const Published: Story = { args: { campaignProp: publishedCampaign } }

/** The Pages toggle pressed while its panel is open. */
export const PagesOpen: Story = {
  args: { initialState: { panel: 'pages' } }
}

/** The Add toggle pressed while its panel is open. */
export const AddOpen: Story = {
  args: { initialState: { panel: 'add' } }
}

/** The Localize toggle pressed while its panel is open. */
export const LocalizeOpen: Story = {
  args: { initialState: { panel: 'localize' } }
}

/** A machine-translation run in flight: progress ringed round the Localize button, whichever panel is open. */
export const LocalizeTranslating: Story = {
  args: {
    run: {
      campaignId: campaign.id,
      languageId: '496',
      mode: CampaignAiTranslateMode.missing,
      languageName: 'Français',
      progress: 45,
      message: 'Translated 2 of 5 parts',
      translatedCount: 7
    }
  }
}

export default LeftRailMeta
