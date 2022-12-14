import { ComponentStory, ComponentMeta } from '@storybook/react'
import Grid from '@mui/material/Grid'
import { watchConfig } from '../../libs/storybook'
import { videos } from '../Videos/testData'
import { VideoCard } from '.'

const VideoCardStory: ComponentMeta<typeof VideoCard> = {
  ...watchConfig,
  component: VideoCard,
  title: 'Watch/VideoCard'
}

const Template: ComponentStory<typeof VideoCard> = (args) => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={4} xl={3}>
        <VideoCard video={videos[0]} {...args} />
      </Grid>
      <Grid item xs={12} md={4} xl={3}>
        <VideoCard video={videos[2]} {...args} />
      </Grid>
      <Grid item xs={12} md={4} xl={3}>
        <VideoCard video={videos[5]} {...args} />
      </Grid>
      <Grid item xs={12} md={4} xl={3}>
        <VideoCard video={videos[6]} {...args} />
      </Grid>
      <Grid item xs={12} md={4} xl={3}>
        <VideoCard video={videos[9]} {...args} />
      </Grid>
      <Grid item xs={12} md={4} xl={3}>
        <VideoCard video={videos[12]} {...args} />
      </Grid>
      <Grid item xs={12} md={4} xl={3}>
        <VideoCard {...args} />
      </Grid>
      <Grid item xs={12} md={4} xl={3}>
        <VideoCard {...args} />
      </Grid>
      <Grid item xs={12} md={4} xl={3}>
        <VideoCard {...args} />
      </Grid>
    </Grid>
  )
}

export const Expanded = Template.bind({})

export const Contained = Template.bind({})
Contained.args = { variant: 'contained' }

export default VideoCardStory
