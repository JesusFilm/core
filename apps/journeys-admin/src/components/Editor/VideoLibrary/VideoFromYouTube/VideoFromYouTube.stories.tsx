import { Story, Meta } from '@storybook/react'
import { SWRConfig } from 'swr'
import { journeysAdminConfig } from '../../../../libs/storybook'
import {
  getVideosLoading,
  getVideosWithOffsetAndUrl
} from './VideoFromYouTube.handlers'
import { VideoFromYouTube } from '.'

const VideoFromYouTubeStory = {
  ...journeysAdminConfig,
  component: VideoFromYouTube,
  title: 'Journeys-Admin/Editor/VideoLibrary/VideoFromYouTube',
  argTypes: { onSelect: { action: 'clicked' } }
}

const Template: Story = ({ onSelect }) => (
  <SWRConfig value={{ provider: () => new Map() }}>
    <VideoFromYouTube onSelect={onSelect} />
  </SWRConfig>
)

export const Default = Template.bind({})
Default.parameters = {
  msw: {
    handlers: [getVideosWithOffsetAndUrl]
  }
}

export const Loading = Template.bind({})
Loading.parameters = {
  msw: {
    handlers: [getVideosLoading]
  }
}

export default VideoFromYouTubeStory as Meta
