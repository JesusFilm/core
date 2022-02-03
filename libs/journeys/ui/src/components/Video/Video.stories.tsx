import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { TreeBlock, journeyUiConfig } from '../..'
import { VideoResponseStateEnum } from '../../../__generated__/globalTypes'
import { VideoFields } from './__generated__/VideoFields'
import { Video, VIDEO_RESPONSE_CREATE } from '.'

const Demo = {
  ...journeyUiConfig,
  component: Video,
  title: 'Journeys-Ui/Video',
  parameters: {
    chromatic: { disableSnapshot: true }
  }
}

const videoBlock: TreeBlock<VideoFields> = {
  __typename: 'VideoBlock',
  id: 'video1.id',
  parentBlockId: 'step1.id',
  parentOrder: 0,
  autoplay: false,
  muted: false,
  title: 'video1',
  videoContent: {
    __typename: 'VideoArclight',
    src: 'https://arc.gt/hls/2_0-FallingPlates/529'
  },
  startAt: null,
  endAt: null,
  posterBlockId: null,
  children: []
}

const Template: Story<TreeBlock<VideoFields>> = ({ ...props }) => (
  <MockedProvider
    mocks={[
      {
        request: {
          query: VIDEO_RESPONSE_CREATE,
          variables: {
            id: 'uuid',
            blockId: 'Video1',
            state: VideoResponseStateEnum.PLAYING,
            position: 0.3
          }
        },
        result: {
          data: {
            id: 'uuid',
            state: VideoResponseStateEnum.PLAYING,
            position: 0.3
          }
        }
      }
    ]}
  >
    <Video {...props} />
  </MockedProvider>
)

export const Default = Template.bind({})
Default.args = {
  ...videoBlock
}
Default.parameters = {
  chromatic: { disableSnapshot: false }
}

export const Autoplay = Template.bind({})
Autoplay.args = {
  ...videoBlock,
  autoplay: true
}

export const Muted = Template.bind({})
Muted.args = {
  ...videoBlock,
  muted: true
}

export const ExternalSource = Template.bind({})
ExternalSource.args = {
  ...videoBlock,
  videoContent: {
    __typename: 'VideoGeneric',
    src: 'https://playertest.longtailvideo.com/adaptive/elephants_dream_v4/index.m3u8'
  }
}

export const StartAt = Template.bind({})
StartAt.args = {
  ...videoBlock,
  startAt: 20
}

// TODO: Add EndAt

export const Poster = Template.bind({})
Poster.args = {
  ...videoBlock,
  posterBlockId: 'posterBlockId',
  children: [
    {
      id: 'posterBlockId',
      __typename: 'ImageBlock',
      src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920',
      alt: 'random image from unsplash',
      width: 1600,
      height: 1067,
      blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL',
      parentBlockId: 'videoBlockId',
      parentOrder: 0,
      children: []
    }
  ]
}
Poster.parameters = {
  chromatic: { disableSnapshot: false }
}

export const NoVideoSource = Template.bind({})
NoVideoSource.args = {
  __typename: 'VideoBlock',
  id: 'video1.id',
  parentBlockId: 'step1.id',
  parentOrder: 0,
  autoplay: false,
  muted: false,
  title: 'video1',
  videoContent: {
    __typename: 'VideoArclight',
    src: null
  },
  startAt: null,
  endAt: null,
  posterBlockId: null,
  children: []
}

export default Demo as Meta
