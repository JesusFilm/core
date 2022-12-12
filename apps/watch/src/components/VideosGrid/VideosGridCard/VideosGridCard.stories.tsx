import { Story, Meta } from '@storybook/react'
import Grid from '@mui/material/Grid'
import { watchConfig } from '../../../libs/storybook/config'
import { videos } from '../../Videos/testData'
import { VideosGridCard } from './VideosGridCard'

const VideosGridCardStory = {
  ...watchConfig,
  component: VideosGridCard,
  title: 'Watch/VideosGridCard'
}

const Template: Story = ({ ...args }) => {
  return (
    <Grid item md={3} sm={6} xs={6} lg={2} xl={2}>
      <VideosGridCard {...args} />
    </Grid>
  )
}

export const Default = Template.bind({})

Default.args = {
  video: videos[0]
}

export default VideosGridCardStory as Meta
