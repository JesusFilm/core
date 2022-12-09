import { Story, Meta } from '@storybook/react'
import Grid from '@mui/material/Grid'
import { watchConfig } from '../../../libs/storybook/config'
import { videos } from '../../Videos/testData'
import { VideoGridCard } from './VideoGridCard'

const VideoGridCardStory = {
  ...watchConfig,
  component: VideoGridCard,
  title: 'Watch/VideoGridCard'
}

const Template: Story = ({ ...args }) => {
  return (
    <Grid item md={3} sm={6} xs={6} lg={2} xl={2}>
      <VideoGridCard {...args} />
    </Grid>
  )
}

export const Default = Template.bind({})

Default.args = {
  video: videos[0]
}

export default VideoGridCardStory as Meta
