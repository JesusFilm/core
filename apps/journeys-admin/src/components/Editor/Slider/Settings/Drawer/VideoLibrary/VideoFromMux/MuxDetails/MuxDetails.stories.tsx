import { Meta, StoryObj } from '@storybook/nextjs'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import {
  VideoBlockObjectFit,
  VideoBlockSource
} from '../../../../../../../../../__generated__/globalTypes'

import { MuxDetails } from '.'

const MuxDetailsStory: Meta<typeof MuxDetails> = {
  ...journeysAdminConfig,
  component: MuxDetails,
  title:
    'Journeys-Admin/Editor/Slider/Settings/Drawer/VideoLibrary/VideoFromMux/MuxDetails',
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
