import Grid from '@mui/material/GridLegacy'
import { Meta, StoryObj } from '@storybook/react'

import { InstantSearchTestWrapper } from '@core/journeys/ui/algolia/InstantSearchTestWrapper'

import { watchConfig } from '../../libs/storybook'
import { videos } from '../Videos/__generated__/testData'
import { getAlgoliaVideosHandlers } from '../VideosPage/VideosPage.handlers'

import { VideoCard } from '.'

const VideoCardStory: Meta<typeof VideoCard> = {
  ...watchConfig,
  component: VideoCard,
  title: 'Watch/VideoCard'
}

const Template: StoryObj<typeof VideoCard> = {
  render: (args) => {
    return (
      <InstantSearchTestWrapper>
        <Grid container spacing={2} rowSpacing={8}>
          <Grid item xs={12} md={4} xl={3}>
            <VideoCard video={videos[0]} {...args} />
          </Grid>
          <Grid item xs={12} md={4} xl={3}>
            <VideoCard video={videos[2]} {...args} active />
          </Grid>
          <Grid item xs={12} md={4} xl={3}>
            <VideoCard video={videos[5]} {...args} />
          </Grid>
          <Grid item xs={12} md={4} xl={3}>
            <VideoCard video={videos[6]} index={0} {...args} />
          </Grid>
          <Grid item xs={12} md={4} xl={3}>
            <VideoCard video={videos[9]} index={1} {...args} />
          </Grid>
          <Grid item xs={12} md={4} xl={3}>
            <VideoCard video={videos[12]} index={2} {...args} />
          </Grid>
          <Grid item xs={12} md={4} xl={3}>
            <VideoCard video={videos[2]} index={3} {...args} />
          </Grid>
          <Grid item xs={12} md={4} xl={3}>
            <VideoCard {...args} />
          </Grid>
          <Grid item xs={12} md={4} xl={3}>
            <VideoCard {...args} />
          </Grid>
        </Grid>
      </InstantSearchTestWrapper>
    )
  }
}

export const Expanded = {
  ...Template,
  parameters: {
    msw: {
      handlers: [getAlgoliaVideosHandlers]
    }
  }
}

export const Contained = {
  ...Template,
  args: { variant: 'contained' },
  parameters: {
    msw: {
      handlers: [getAlgoliaVideosHandlers]
    }
  }
}

export default VideoCardStory
