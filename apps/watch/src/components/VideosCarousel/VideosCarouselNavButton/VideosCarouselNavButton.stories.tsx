import { Story, Meta } from '@storybook/react'
import { ComponentProps } from 'react'
import Stack from '@mui/material/Stack'

import { watchConfig } from '../../../libs/storybook'
import { VideosCarouselNavButton } from './VideosCarouselNavButton'

const VideosCarouselNavButtonStory = {
  ...watchConfig,
  component: VideosCarouselNavButton,
  title: 'Watch/VideosCarousel/VideosCarouselNavButton'
}

const Template: Story<ComponentProps<typeof VideosCarouselNavButton>> = () => {
  return (
    <Stack sx={{ position: 'absolute', width: 400, height: 100 }}>
      <VideosCarouselNavButton variant="prev" />
      <VideosCarouselNavButton variant="next" />
    </Stack>
  )
}

export const Default = Template.bind({})

export default VideosCarouselNavButtonStory as Meta
