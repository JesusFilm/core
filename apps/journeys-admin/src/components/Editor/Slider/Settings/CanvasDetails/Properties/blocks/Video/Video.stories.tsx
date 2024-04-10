import { Meta, StoryObj } from '@storybook/react'
import { ComponentPropsWithoutRef } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import { BlockFields_VideoBlock as VideoBlock } from '../../../../../../../../../__generated__/BlockFields'
import { VideoBlockSource } from '../../../../../../../../../__generated__/globalTypes'
import { simpleComponentConfig } from '../../../../../../../../libs/storybook'
import { Drawer } from '../../../../Drawer'

import { Video } from './Video'

const VideoDemo: Meta<typeof Video> = {
  ...simpleComponentConfig,
  component: Video,
  title:
    'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/Properties/blocks/Video'
}

const Template: StoryObj<ComponentPropsWithoutRef<typeof Video>> = {
  render: ({ ...args }) => {
    return (
      <EditorProvider initialState={{ selectedBlock: { ...args } }}>
        <Drawer title="Video Properties">
          <Video {...args} />
        </Drawer>
      </EditorProvider>
    )
  }
}

const defaultVideo: TreeBlock<VideoBlock> = {
  id: 'video1.id',
  __typename: 'VideoBlock',
  parentBlockId: 'card1.id',
  parentOrder: 0,
  startAt: 0,
  endAt: null,
  muted: true,
  autoplay: true,
  fullsize: true,
  action: null,
  videoId: null,
  videoVariantLanguageId: null,
  source: VideoBlockSource.internal,
  title: null,
  description: null,
  duration: null,
  image: null,
  video: null,
  posterBlockId: null,
  objectFit: null,
  children: []
}

export const Default = {
  ...Template,
  args: {
    ...defaultVideo
  }
}

export const Filled = {
  ...Template,
  args: {
    ...defaultVideo,
    videoId: '2_0-FallingPlates',
    videoVariantLanguageId: '529',
    video: {
      __typename: 'Video',
      id: '2_0-FallingPlates',
      title: [
        {
          __typename: 'Translation',
          value: 'FallingPlates'
        }
      ],
      image:
        'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_0-FallingPlates.mobileCinematicHigh.jpg',
      variant: {
        __typename: 'VideoVariant',
        id: '2_0-FallingPlates-529',
        hls: 'https://arc.gt/hls/2_0-FallingPlates/529'
      }
    }
  }
}

export default VideoDemo
