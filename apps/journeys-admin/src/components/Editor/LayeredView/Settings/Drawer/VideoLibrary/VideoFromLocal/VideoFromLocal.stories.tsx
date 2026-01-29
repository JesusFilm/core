import { Meta, StoryObj } from '@storybook/nextjs'

import { InstantSearchTestWrapper } from '@core/journeys/ui/algolia/InstantSearchTestWrapper'
import { journeysAdminConfig } from '@core/shared/ui/storybook'

import {
  getAlgoliaVideosHandlers,
  loadingHandler
} from '../VideoLibrary.handlers'

import { VideoFromLocal } from '.'

const VideoFromLocalStory: Meta<typeof VideoFromLocal> = {
  ...journeysAdminConfig,
  component: VideoFromLocal,
  title:
    'Journeys-Admin/Editor/Slider/Settings/Drawer/VideoLibrary/VideoFromLocal',
  argTypes: { onSelect: { action: 'clicked' } }
}

const Template: StoryObj<typeof VideoFromLocal> = {
  render: ({ onSelect }) => (
    <InstantSearchTestWrapper>
      <VideoFromLocal onSelect={onSelect} />
    </InstantSearchTestWrapper>
  )
}

export const Default = {
  ...Template,
  parameters: {
    msw: {
      handlers: [getAlgoliaVideosHandlers]
    }
  }
}

const LoadingTemplate: StoryObj<typeof VideoFromLocal> = {
  render: ({ onSelect }) => {
    return (
      <InstantSearchTestWrapper>
        <VideoFromLocal onSelect={onSelect} />
      </InstantSearchTestWrapper>
    )
  }
}

export const Loading = {
  ...LoadingTemplate,
  parameters: {
    msw: {
      handlers: [loadingHandler]
    }
  }
}

export default VideoFromLocalStory
