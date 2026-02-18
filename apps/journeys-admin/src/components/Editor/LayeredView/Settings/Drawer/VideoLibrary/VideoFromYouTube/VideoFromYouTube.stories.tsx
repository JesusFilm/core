import { Meta, StoryObj } from '@storybook/nextjs'
import { SWRConfig } from 'swr'

import { InstantSearchTestWrapper } from '@core/journeys/ui/algolia/InstantSearchTestWrapper'
import { journeysAdminConfig } from '@core/shared/ui/storybook'

import {
  getPlaylistItemsLoading,
  getPlaylistItemsWithOffsetAndUrl
} from './VideoFromYouTube.handlers'

import { VideoFromYouTube } from '.'

const VideoFromYouTubeStory: Meta<typeof VideoFromYouTube> = {
  ...journeysAdminConfig,
  component: VideoFromYouTube,
  title:
    'Journeys-Admin/Editor/Slider/Settings/Drawer/VideoLibrary/VideoFromYouTube',
  argTypes: { onSelect: { action: 'clicked' } }
}

const Template: StoryObj<typeof VideoFromYouTube> = {
  render: ({ onSelect }) => (
    <InstantSearchTestWrapper>
      <SWRConfig value={{ provider: () => new Map() }}>
        <VideoFromYouTube onSelect={onSelect} />
      </SWRConfig>
    </InstantSearchTestWrapper>
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
