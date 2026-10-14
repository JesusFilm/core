import { MockedProvider } from '@apollo/client/testing/react'
import { Meta, StoryObj } from '@storybook/nextjs-vite'
import { SnackbarProvider } from 'notistack'
import { ReactElement } from 'react'
import { screen, userEvent } from 'storybook/test'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { GET_CURRENT_USER } from '../../libs/useCurrentUserLazyQuery'

import { CampaignEditor } from './CampaignEditor'
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

/** At 1280 px, the minimum, an open panel overlays the canvas. */
export const PanelOverlaysAt1280: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  play: openPagesPanel
}

/** At 1440 px an open panel pushes the canvas. */
export const PanelPushesAt1440: Story = {
  parameters: { chromatic: { viewports: [1440] } },
  play: openPagesPanel
}

async function openAddPanel(): Promise<void> {
  await userEvent.click(await screen.findByRole('button', { name: 'Add' }))
}

/** The whole shell at the 1280 px minimum, the Add panel overlaying the canvas. */
export const Shell1280: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  play: openAddPanel
}

/** The whole shell at 1440 px, the Add panel pushing the canvas. */
export const Shell1440: Story = {
  parameters: { chromatic: { viewports: [1440] } },
  play: openAddPanel
}

/** The whole shell at 1920 px, the Add panel pushing the canvas. */
export const Shell1920: Story = {
  parameters: { chromatic: { viewports: [1920] } },
  play: openAddPanel
}

/** The Desktop frame is 1200 px wide inside, scaled to about 0.69 to fit between the rail and the Inspector. */
export const ScaledFrameAt1280: Story = {
  parameters: { chromatic: { viewports: [1280] } }
}

/** About 0.83 with no panel open. */
export const ScaledFrameAt1440: Story = {
  parameters: { chromatic: { viewports: [1440] } }
}

/** Wide enough for the frame at its real width, so it is not scaled. */
export const ScaledFrameAt1920: Story = {
  parameters: { chromatic: { viewports: [1920] } }
}

/** A pushed panel takes 300 px, so the frame scales further (about 0.58 at 1440 px). */
export const ScaledFrameWithPushedPanelAt1440: Story = {
  parameters: { chromatic: { viewports: [1440] } },
  play: openPagesPanel
}

export default CampaignEditorMeta
