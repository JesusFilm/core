import Box from '@mui/material/Box'
import { Story, Meta } from '@storybook/react'
import { watchConfig } from '../../../../libs/storybook'
import { videos } from '../../testData'
import { VideoGridCard } from './VideoGridCard'

const VideoGridCardStory = {
  ...watchConfig,
  component: VideoGridCard,
  title: 'Watch/VideoGridCard'
}

const Template: Story = ({ ...args }) => {
  return (
    <Box sx={{ maxWidth: '338px', display: 'flex', alignItems: 'flex-start' }}>
      <VideoGridCard {...args} />
    </Box>
  )
}

export const Default = Template.bind({})

Default.args = {
  video: videos[0]
}

export default VideoGridCardStory as Meta
