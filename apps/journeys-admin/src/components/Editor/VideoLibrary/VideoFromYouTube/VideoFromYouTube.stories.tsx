import { Meta, StoryObj } from '@storybook/react'
import { SWRConfig } from 'swr'

import { journeysAdminConfig } from '../../../../libs/storybook'

import {
  getPlaylistItemsLoading,
  getPlaylistItemsWithOffsetAndUrl
} from './VideoFromYouTube.handlers'

import { VideoFromYouTube } from '.'

const VideoFromYouTubeStory: Meta<typeof VideoFromYouTube> = {
  ...journeysAdminConfig,
  component: VideoFromYouTube,
  title: 'Journeys-Admin/Editor/VideoLibrary/VideoFromYouTube',
  argTypes: { onSelect: { action: 'clicked' } }
}

const Template: StoryObj<typeof VideoFromYouTube> = {
  render: ({ onSelect }) => (
    <SWRConfig value={{ provider: () => new Map() }}>
      <VideoFromYouTube onSelect={onSelect} />
    </SWRConfig>
  )
}

export const Default = {
  ...Template,
  parameters: {
    msw: {
      handlers: [getPlaylistItemsWithOffsetAndUrl]
    }
  }
}

export const Loading = {
  ...Template,
  parameters: {
    msw: {
      handlers: [getPlaylistItemsLoading]
    }
  }
}

export default VideoFromYouTubeStory
