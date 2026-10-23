import { MockedProvider } from '@apollo/client/testing/react'
import { Meta, StoryObj } from '@storybook/nextjs-vite'
import { SnackbarProvider } from 'notistack'
import { ReactElement } from 'react'
import { screen, userEvent } from 'storybook/test'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { GET_CURRENT_USER } from '../../libs/useCurrentUserLazyQuery'

import { CampaignEditor, EDITOR_MIN_WIDTH } from './CampaignEditor'
import { CURRENT_USER_ID, campaign } from './data'

const currentUserMock = {
  request: { query: GET_CURRENT_USER },
  result: {
    data: {
      me: {
        __typename: 'AuthenticatedUser',
        id: CURRENT_USER_ID,
        email: 'test@example.com'
      }
    }
  }
}

function CampaignEditorStory(): ReactElement {
  return (
    <MockedProvider mocks={[currentUserMock]}>
      <SnackbarProvider>
        <CampaignEditor campaign={campaign} />
      </SnackbarProvider>
    </MockedProvider>
  )
}

const CampaignEditorMeta: Meta<typeof CampaignEditorStory> = {
  ...journeysAdminConfig,
  component: CampaignEditorStory,
  title: 'Journeys-Admin/CampaignEditor/Shell',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

type Story = StoryObj<typeof CampaignEditorStory>

async function openPagesPanel(): Promise<void> {
  await userEvent.click(await screen.findByRole('button', { name: 'Pages' }))
}

/** At 1348 px, the minimum, the Pages panel is docked beside the rail and the Desktop frame fits between it and the Inspector at 0.5. */
export const PanelDockedAtMinimum: Story = {
  parameters: { chromatic: { viewports: [EDITOR_MIN_WIDTH] } },
  play: openPagesPanel
}

/** At 1440 px the Pages panel is docked beside the rail, the frame at about 0.58. */
export const PanelDockedAt1440: Story = {
  parameters: { chromatic: { viewports: [1440] } },
  play: openPagesPanel
}

/** The Desktop frame is 1200 px wide inside, scaled to 0.5 to fit between the docked Add panel and the Inspector at the 1348 px minimum. */
export const ScaledFrameAtMinimum: Story = {
  parameters: { chromatic: { viewports: [EDITOR_MIN_WIDTH] } }
}

/** About 0.58 at 1440 px. */
export const ScaledFrameAt1440: Story = {
  parameters: { chromatic: { viewports: [1440] } }
}

/** About 0.98 at 1920 px. */
export const ScaledFrameAt1920: Story = {
  parameters: { chromatic: { viewports: [1920] } }
}

export default CampaignEditorMeta
