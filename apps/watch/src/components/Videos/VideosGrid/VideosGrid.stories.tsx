import { Story, Meta } from '@storybook/react'
import { watchConfig } from '../../../libs/storybook'
import { videos } from '../testData'
import { VideosGrid } from './VideosGrid'

const VideosGridStory = {
  ...watchConfig,
  component: VideosGrid,
  title: 'Watch/VideosGrid'
}

const Template: Story = ({ ...args }) => {
  return <VideosGrid {...args} />
}

export const Default = Template.bind({})

Default.args = {
  videos: videos
}

export default VideosGridStory as Meta
