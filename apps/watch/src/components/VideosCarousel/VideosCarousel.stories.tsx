import Typography from '@mui/material/Typography'
import { Story, Meta } from '@storybook/react'
import { ComponentProps } from 'react'
import { watchConfig } from '../../libs/storybook'
import { CarouselItem } from '../Video/CarouselItem'
import { videos } from '../Videos/testData'
import { VideosCarousel } from './VideosCarousel'

const VideosCarouselStory = {
  ...watchConfig,
  component: VideosCarousel,
  title: 'Watch/VideosCarousel',
  parameters: {
    ...watchConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: Story<ComponentProps<typeof VideosCarousel>> = ({
  ...args
}) => {
  return (
    <>
      <Typography gutterBottom>
        View without storybook sidebar for correct spacing
      </Typography>
      <VideosCarousel {...args} />
    </>
  )
}

export const Default = Template.bind({})
Default.args = {
  videos,
  renderItem: (props: Parameters<typeof CarouselItem>[0]) => {
    return <CarouselItem {...props} />
  }
}

export const NoScroll = Template.bind({})
NoScroll.args = {
  ...Default.args,
  videos: [videos[0]]
}

export default VideosCarouselStory as Meta
