import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { journeysAdminConfig } from '../../../../libs/storybook'
import { VideoDetails } from '../VideoFromLocal/VideoDetails'
import { VideoListProps } from './VideoList'
import { videos } from './data'
import { VideoList } from '.'

const VideoListStory = {
  ...journeysAdminConfig,
  component: VideoList,
  title: 'Journeys-Admin/Editor/VideoLibrary/VideoList',
  argTypes: {
    fetchMore: { action: 'fetched' },
    onSelect: { action: 'selected' }
  }
}

const Template: Story<VideoListProps> = (args) => (
  <MockedProvider>
    <VideoList {...args} VideoDetails={VideoDetails} />
  </MockedProvider>
)

export const Default = Template.bind({})
Default.args = {
  videos,
  hasMore: true
}

export const Loading: Story = Template.bind({})
Loading.args = {
  loading: true
}

export const Empty: Story = Template.bind({})
Empty.args = {
  videos: [],
  hasMore: true
}

export default VideoListStory as Meta
