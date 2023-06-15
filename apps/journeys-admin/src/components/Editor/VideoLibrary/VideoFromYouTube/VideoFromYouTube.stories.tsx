import { Story, Meta } from '@storybook/react'
import { SWRConfig } from 'swr'
import { journeysAdminConfig } from '../../../../libs/storybook'
import { ApolloLoadingProvider } from '../../../../../test/ApolloLoadingProvider'
import {
  getPlaylistItemsLoading,
  getPlaylistItemsWithOffsetAndUrl
} from './VideoFromYouTube.handlers'
import { VideoFromYouTube } from '.'

const VideoFromYouTubeStory = {
  ...journeysAdminConfig,
  component: VideoFromYouTube,
  title: 'Journeys-Admin/Editor/VideoLibrary/VideoFromYouTube',
  argTypes: { onSelect: { action: 'clicked' } }
}

const Template: Story = ({ onSelect }) => (
  <ApolloLoadingProvider>
    <SWRConfig value={{ provider: () => new Map() }}>
      <VideoFromYouTube onSelect={onSelect} />
    </SWRConfig>
  </ApolloLoadingProvider>
)

export const Default = Template.bind({})
Default.parameters = {
  msw: {
    handlers: [getPlaylistItemsWithOffsetAndUrl]
  }
}

export const Loading = Template.bind({})
Loading.parameters = {
  msw: {
    handlers: [getPlaylistItemsLoading]
  }
}

export default VideoFromYouTubeStory as Meta
