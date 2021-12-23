import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { journeysConfig } from '../../../libs/storybook'
import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../__generated__/GetJourney'
import { VideoResponseStateEnum } from '../../../../__generated__/globalTypes'
import { Conductor, ConductorProps } from '../../Conductor'
import { TreeBlock } from '../../../libs/transformer/transformer'
import { Video, VIDEO_RESPONSE_CREATE } from '.'

const Demo = {
  ...journeysConfig,
  component: Video,
  title: 'Journeys/Blocks/Video',
  parameters: {
    chromatic: { disableSnapshot: true }
  }
}

const videoBlock: TreeBlock<VideoBlock> = {
  __typename: 'VideoBlock',
  id: 'Video1',
  parentBlockId: 'step1.id',
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

// TODO: Move to Conductor data and autogenerate
const conductorProps = (content: TreeBlock[]): TreeBlock[] => {
  return [
    {
      id: 'step1.id',
      __typename: 'StepBlock',
      parentBlockId: null,
      locked: false,
      nextBlockId: 'step2.id',
      children: [
        {
          id: 'card1.id',
          __typename: 'CardBlock',
          parentBlockId: 'step1.id',
          coverBlockId: 'null',
          backgroundColor: null,
          themeMode: null,
          themeName: null,
          fullscreen: false,
          children: content
        }
      ]
    }
  ]
}

const Template: Story<ConductorProps> = ({ ...props }) => (
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
    <Conductor {...props} />
  </MockedProvider>
)

const Default = Template.bind({})
Default.args = {
  blocks: conductorProps([videoBlock])
}
Default.parameters = {
  chromatic: { disableSnapshot: false }
}

const Autoplay = Template.bind({})
Autoplay.args = {
  blocks: conductorProps([{ ...videoBlock, autoplay: true }])
}

const Muted = Template.bind({})
Muted.args = {
  blocks: conductorProps([{ ...videoBlock, muted: true }])
}

const ExternalSource = Template.bind({})
ExternalSource.args = {
  blocks: conductorProps([
    {
      ...videoBlock,
      videoContent: {
        __typename: 'VideoGeneric',
        src: 'https://playertest.longtailvideo.com/adaptive/elephants_dream_v4/index.m3u8'
      }
    }
  ])
}

const StartAt = Template.bind({})
StartAt.args = {
  blocks: conductorProps([
    {
      ...videoBlock,
      startAt: 20
    }
  ])
}

// TODO: Add EndAt

const Poster = Template.bind({})
Poster.args = {
  blocks: conductorProps([
    {
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
          children: []
        }
      ]
    }
  ])
}
Poster.parameters = {
  chromatic: { disableSnapshot: false }
}

export default Demo as Meta
export { Default, Autoplay, Muted, ExternalSource, StartAt, Poster }
