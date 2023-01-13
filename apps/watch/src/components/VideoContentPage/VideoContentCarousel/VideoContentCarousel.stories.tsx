import { ComponentProps } from 'react'
import { Story, Meta } from '@storybook/react'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import { watchConfig } from '../../../libs/storybook'
import { VideoProvider } from '../../../libs/videoContext'
import { VideoContentFields } from '../../../../__generated__/VideoContentFields'
import { videos } from '../../Videos/testData'
import { VideoContentCarousel } from '.'

const VideoContentCarouselStory = {
  ...watchConfig,
  component: VideoContentCarousel,
  title: 'Watch/VideoContentCarousel',
  parameters: {
    ...watchConfig.parameters,
    layout: 'fullscreen'
  },
  argTypes: {
    onShareClick: { action: 'share clicked' },
    onDownloadClick: { action: 'download clicked' }
  }
}

const Template: Story<
  ComponentProps<typeof VideoContentCarousel> & {
    content: VideoContentFields
    container?: VideoContentFields
  }
> = ({ content, container, ...args }) => (
  <Stack>
    <Typography gutterBottom>
      Standalone videos and videos with no siblings don&apos;t show
      VideoContentCarousel
    </Typography>
    <VideoProvider value={{ content: videos[19], container: videos[0] }}>
      <VideoContentCarousel {...args} />
    </VideoProvider>
    {/* TODO: Add series and collection */}
  </Stack>
)

export const Default = Template.bind({})
Default.args = {
  videoChildren: []
}

const PlayingTemplate: Story<ComponentProps<typeof VideoContentCarousel>> = ({
  ...args
}) => (
  // Standalone, video with siblings
  <Stack>
    <VideoProvider value={{ content: { ...videos[0], children: [] } }}>
      <VideoContentCarousel {...args} />
    </VideoProvider>
    <Divider />
    <VideoProvider value={{ content: videos[19], container: videos[0] }}>
      <VideoContentCarousel {...args} />
    </VideoProvider>
  </Stack>
)

export const Playing = PlayingTemplate.bind({})
Playing.args = {
  playing: true,
  videoChildren: []
}

export default VideoContentCarouselStory as Meta
