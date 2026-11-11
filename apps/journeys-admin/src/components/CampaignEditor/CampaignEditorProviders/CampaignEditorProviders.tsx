import { ReactElement, ReactNode } from 'react'

import { CommandProvider } from '@core/journeys/ui/CommandProvider'

import { GetCampaign_campaign as Campaign } from '../../../../__generated__/GetCampaign'
import { MuxVideoUploadProvider } from '../../MuxVideoUploadProvider'
import {
  CampaignEditorProvider,
  CampaignEditorState
} from '../CampaignEditorProvider'
import { CampaignHoverProvider } from '../CampaignHoverProvider'
import { TranslationRunProvider } from '../TranslationRunProvider'
import { CampaignCommandProvider } from '../utils/useCampaignCommand'

interface CampaignEditorProvidersProps {
  campaign: Campaign
  /** Overrides the editor's first-open state; the shell never passes it, specs do. */
  initialState?: Partial<CampaignEditorState>
  children: ReactNode
}

/**
 * The editor's provider stack, in the one order the shell and its specs
 * share: one CommandProvider spanning both pages so the Command history
 * survives switching page, the selection reducer, the Campaign Command module
 * with its one queue of Command steps, the Mux upload queue (so a Media Slot
 * upload outlives the selection), the machine-translation run (so it outlives
 * the Localize panel) and the hover store.
 */
export function CampaignEditorProviders({
  campaign,
  initialState,
  children
}: CampaignEditorProvidersProps): ReactElement {
  return (
    <CommandProvider>
      <CampaignEditorProvider campaign={campaign} initialState={initialState}>
        <CampaignCommandProvider>
          <MuxVideoUploadProvider>
            <TranslationRunProvider>
              <CampaignHoverProvider>{children}</CampaignHoverProvider>
            </TranslationRunProvider>
          </MuxVideoUploadProvider>
        </CampaignCommandProvider>
      </CampaignEditorProvider>
    </CommandProvider>
  )
}
