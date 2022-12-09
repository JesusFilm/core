import { Story, Meta } from '@storybook/react'
import { watchConfig } from '../../libs/storybook/config'
import { videos } from '../Videos/testData'
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
  videos: videos.slice(0, 8)
}

export default VideosGridStory as Meta
