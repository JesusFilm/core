import { Meta, StoryObj } from '@storybook/react'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { MuxDetails } from '.'
import {
  VideoBlockObjectFit,
  VideoBlockSource
} from 'libs/journeys/ui/__generated__/globalTypes'

const MuxDetailsStory: Meta<typeof MuxDetails> = {
  ...journeysAdminConfig,
  component: MuxDetails,
  title:
    'Journeys-Admin/Editor/Slider/Settings/Drawer/VideoLibrary/VideoFromCloudflare/CloudflareDetails',
  argTypes: { onSelect: { action: 'clicked' } }
}

const Template: StoryObj<typeof MuxDetails> = {
  render: ({ activeVideoBlock, onSelect }) => {
    return (
      <MuxDetails
        activeVideoBlock={activeVideoBlock}
        open
        onSelect={onSelect}
      />
    )
  }
}

export const Default = {
  ...Template,
  args: {
    activeVideoBlock: {
      __typename: 'VideoBlock',
      id: 'videoId',
      parentBlockId: 'parentBlockId',
      parentOrder: 0,
      muted: false,
      autoplay: false,
      startAt: 0,
      endAt: 10,
      posterBlockId: null,
      fullsize: true,
      children: [],
      videoId: 'videoId',
      videoVariantLanguageId: null,
      source: VideoBlockSource.mux,
      title: 'title',
      description: null,
      image: null,
      duration: 10,
      objectFit: VideoBlockObjectFit.fill,
      action: null,
      mediaVideo: {
        __typename: 'MuxVideo',
        id: 'videoId',
        assetId: 'assetId',
        playbackId: 'playbackId'
      }
    }
  }
}

export default MuxDetailsStory
