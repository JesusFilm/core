import { MockedProvider } from '@apollo/client/testing/react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ReactElement } from 'react'
import { userEvent, within } from 'storybook/test'

import { CommandProvider } from '@core/journeys/ui/CommandProvider'
import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { CampaignEditorProvider } from '../../CampaignEditorProvider'
import { campaign } from '../../data'
import { CampaignCommandProvider } from '../../utils/useCampaignCommand'

import { CanvasInsertPoint } from '.'

function SectionStand({ label }: { label: string }): ReactElement {
  return (
    <Box
      sx={{
        height: 120,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.paper'
      }}
    >
      <Typography>{label}</Typography>
    </Box>
  )
}

/** The seam between two sections, with the "+" resting hidden until hovered. */
function CanvasInsertPointStory(): ReactElement {
  return (
    <MockedProvider>
      <CommandProvider>
        <CampaignEditorProvider campaign={campaign}>
          <CampaignCommandProvider>
            <Box sx={{ width: 480, bgcolor: 'background.default' }}>
              <SectionStand label="Hero" />
              <CanvasInsertPoint pageId="landingPageId" parentOrder={1} />
              <SectionStand label="Region switcher" />
            </Box>
          </CampaignCommandProvider>
        </CampaignEditorProvider>
      </CommandProvider>
    </MockedProvider>
  )
}

const CanvasInsertPointMeta: Meta<typeof CanvasInsertPointStory> = {
  ...journeysAdminConfig,
  component: CanvasInsertPointStory,
  title: 'Journeys-Admin/CampaignEditor/Canvas/CanvasInsertPoint',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'centered'
  }
}

type Story = StoryObj<typeof CanvasInsertPointStory>

/** At rest the seam shows nothing. */
export const Resting: Story = {}

/** Hovering the seam shows the "+". */
export const Hovered: Story = {
  play: async ({ canvasElement }) => {
    const button = await within(canvasElement).findByRole('button', {
      name: 'Add section here'
    })
    await userEvent.hover(button)
  }
}

export default CanvasInsertPointMeta
