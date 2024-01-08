import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'

import { journeysAdminConfig } from '../../../../libs/storybook'

import { videos } from './data'

import { VideoList } from '.'

const VideoListStory: Meta<typeof VideoList> = {
  ...journeysAdminConfig,
  component: VideoList,
  title: 'Journeys-Admin/Editor/VideoLibrary/VideoList',
  argTypes: {
    fetchMore: { action: 'fetched' },
    onSelect: { action: 'selected' }
  }
}

type Story = StoryObj<typeof VideoList>

const Template: Story = {
  render: (args) => (
    <MockedProvider>
      <VideoList {...args} />
    </MockedProvider>
  )
}

export const Default = {
  ...Template,
  args: {
    videos,
    hasMore: true
  }
}

export const Loading = {
  ...Template,
  args: {
    loading: true
  }
}

export const Empty = {
  ...Template,
  args: {
    videos: [],
    hasMore: true
  }
}

export default VideoListStory
