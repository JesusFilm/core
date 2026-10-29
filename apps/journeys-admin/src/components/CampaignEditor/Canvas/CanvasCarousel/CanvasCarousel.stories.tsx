import Box from '@mui/material/Box'
import { ThemeProvider } from '@mui/material/styles'
import { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ReactElement } from 'react'

import {
  createCampaignTheme,
  transformCampaignBlocks
} from '@core/journeys/ui/Campaign'
import { youTubeVideoBlock } from '@core/journeys/ui/Campaign/testData'
import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { campaign, withEmptyTranslations } from '../../data'
import { StaticEditor } from '../../testing'
import type { CanvasBlock } from '../canvasBlock'
import { CanvasSection } from '../CanvasSection'

const withCards = {
  ...campaign,
  blocks: [
    ...campaign.blocks,
    ...Array.from({ length: 8 }, (_, index) => ({
      ...withEmptyTranslations(youTubeVideoBlock),
      id: `cardId${index}`,
      parentBlockId: 'carouselId',
      parentOrder: index,
      title: `Outreach around the world ${index + 1}`
    }))
  ]
}

const carouselBlock = transformCampaignBlocks(withCards.blocks as never).find(
  (block) => block.id === 'carouselId'
) as CanvasBlock

const theme = createCampaignTheme(campaign.theme, false)

/** The Video Carousel on the 1200 px Desktop frame, with more cards than fit and the read-only arrows. */
function CanvasCarouselStory(): ReactElement {
  return (
    <StaticEditor campaignProp={withCards}>
      <ThemeProvider theme={theme}>
        <Box sx={{ width: 1200 }}>
          <CanvasSection block={carouselBlock} />
        </Box>
      </ThemeProvider>
    </StaticEditor>
  )
}

const CanvasCarouselMeta: Meta<typeof CanvasCarouselStory> = {
  ...journeysAdminConfig,
  component: CanvasCarouselStory,
  title: 'Journeys-Admin/CampaignEditor/Canvas/CanvasCarousel',
  parameters: { ...journeysAdminConfig.parameters, layout: 'fullscreen' }
}

type Story = StoryObj<typeof CanvasCarouselStory>

export const ManyCards: Story = {}

export default CanvasCarouselMeta
