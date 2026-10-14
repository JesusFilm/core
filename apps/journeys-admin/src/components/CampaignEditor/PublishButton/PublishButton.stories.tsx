import { MockedProvider } from '@apollo/client/testing/react'
import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/nextjs-vite'
import { SnackbarProvider } from 'notistack'
import { ReactElement } from 'react'
import { screen, userEvent } from 'storybook/test'

import { CommandProvider } from '@core/journeys/ui/CommandProvider'
import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { GetCampaign_campaign as Campaign } from '../../../../__generated__/GetCampaign'
import { CampaignEditorProvider } from '../CampaignEditorProvider'
import { campaign, publishedCampaign } from '../data'

import { PublishButton } from '.'

interface PublishButtonStoryProps {
  campaignProp?: Campaign
  isManager?: boolean
}

function PublishButtonStory({
  campaignProp = campaign,
  isManager = true
}: PublishButtonStoryProps): ReactElement {
  return (
    <MockedProvider>
      <SnackbarProvider>
        <CommandProvider>
          <CampaignEditorProvider campaign={campaignProp}>
            <Box sx={{ p: 2, height: 360, width: 360 }}>
              <PublishButton isManager={isManager} />
            </Box>
          </CampaignEditorProvider>
        </CommandProvider>
      </SnackbarProvider>
    </MockedProvider>
  )
}

const PublishButtonMeta: Meta<typeof PublishButtonStory> = {
  ...journeysAdminConfig,
  component: PublishButtonStory,
  title: 'Journeys-Admin/CampaignEditor/PublishButton',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'centered'
  }
}

type Story = StoryObj<typeof PublishButtonStory>

async function openPopover(): Promise<void> {
  await userEvent.click(
    await screen.findByRole('button', { name: 'Publish status' })
  )
}

/** A draft campaign: the popover offers Publish with no confirmation. */
export const DraftPopover: Story = { play: openPopover }

/** A published campaign: the popover offers Unpublish behind a confirmation. */
export const PublishedPopover: Story = {
  args: { campaignProp: publishedCampaign },
  play: openPopover
}

/** A member who is not a manager: Publish is disabled, Open page still works. */
export const NonManagerPopover: Story = {
  args: { isManager: false },
  play: openPopover
}

export default PublishButtonMeta
