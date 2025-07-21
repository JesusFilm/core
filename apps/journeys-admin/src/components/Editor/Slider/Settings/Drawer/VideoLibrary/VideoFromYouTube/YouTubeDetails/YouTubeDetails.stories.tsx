import { Meta, StoryObj } from '@storybook/nextjs'
import { SWRConfig } from 'swr'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import {
  getVideosLoading,
  getVideosWithOffsetAndUrl
} from '../VideoFromYouTube.handlers'

import { YouTubeDetails } from '.'

const YouTubeDetailsStory: Meta<typeof YouTubeDetails> = {
  ...journeysAdminConfig,
  component: YouTubeDetails,
  title:
    'Journeys-Admin/Editor/Slider/Settings/Drawer/VideoLibrary/VideoFromYouTube/YouTubeDetails',
  argTypes: { onSelect: { action: 'clicked' } }
}

const Template: StoryObj<typeof YouTubeDetails> = {
  render: ({ id, onSelect }) => {
    return (
      <SWRConfig value={{ provider: () => new Map() }}>
        <YouTubeDetails id={id} open onSelect={onSelect} />
      </SWRConfig>
    )
  }
}

export const Default = {
  ...Template,
  args: {
    id: 'jQaeIJOA6J0'
  },
  parameters: {
    msw: {
      handlers: [getVideosWithOffsetAndUrl]
    }
  }
}

export const Loading: StoryObj<typeof YouTubeDetails> = {
  ...Template,
  args: {
    id: 'jQaeIJOA6J0'
  },
  parameters: {
    msw: {
      handlers: [getVideosLoading]
    }
  }
}

export default YouTubeDetailsStory
