import { MockedProvider } from '@apollo/client/testing'
import { Meta, Story } from '@storybook/react'

import { journeysAdminConfig } from '../../../../libs/storybook'

import { videos } from './data'
import { VideoListProps } from './VideoList'

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
    <VideoList {...args} />
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
