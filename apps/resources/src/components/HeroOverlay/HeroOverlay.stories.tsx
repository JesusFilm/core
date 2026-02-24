import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/nextjs'

import { watchConfig } from '../../libs/storybook'

import { HeroOverlay } from '.'

const HeroOverlayStory: Meta<typeof HeroOverlay> = {
  ...watchConfig,
  component: HeroOverlay,
  title: 'Watch/HeroOverlay'
}

const Template: StoryObj<typeof HeroOverlay> = {
  render: () => (
    <Box
      sx={{
        height: '300px',
        width: '300px',
        position: 'relative'
      }}
    >
      <HeroOverlay />
    </Box>
  )
}

export const Default = { ...Template }

export default HeroOverlayStory
