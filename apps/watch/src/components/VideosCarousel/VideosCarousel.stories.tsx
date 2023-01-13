import Typography from '@mui/material/Typography'
import { Story, Meta } from '@storybook/react'
import { ComponentProps } from 'react'
import { watchConfig } from '../../libs/storybook'
import { VideoCard } from '../VideoCard'
import { videos } from '../Videos/__generated__/testData'
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
  renderItem: (props: Parameters<typeof VideoCard>[0]) => {
    return <VideoCard {...props} />
  }
}

export const NoScroll = Template.bind({})
NoScroll.args = {
  ...Default.args,
  videos: [videos[0]]
}

export default VideosCarouselStory as Meta
