import { ComponentStory, Meta } from '@storybook/react'
import Box from '@mui/material/Box'
import { watchConfig } from '../../libs/storybook'
import { HeroOverlay } from '.'

const HeroOverlayStory = {
  ...watchConfig,
  component: HeroOverlay,
  title: 'Watch/Hero/HeroOverlay'
}

const Template: ComponentStory<typeof HeroOverlay> = () => (
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

export const Default = Template.bind({})

export default HeroOverlayStory as Meta
