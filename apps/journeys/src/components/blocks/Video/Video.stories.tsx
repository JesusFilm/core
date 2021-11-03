import { Story, Meta } from '@storybook/react'
import { Video, VIDEO_RESPONSE_CREATE } from '.'
import { journeysConfig } from '../../../libs/storybook'
import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../__generated__/GetJourney'
import { MockedProvider } from '@apollo/client/testing'
import { VideoResponseStateEnum } from '../../../../__generated__/globalTypes'
import Conductor, { ConductorProps } from '../../Conductor'
import { TreeBlock } from '../../../libs/transformer/transformer'

const Demo = {
  ...journeysConfig,
  component: Video,
  title: 'Journeys/Blocks/Video'
}

const videoBlock: TreeBlock<VideoBlock> = {
  __typename: 'VideoBlock',
  id: 'Video1',
  parentBlockId: 'step1.id',
  autoplay: true,
  muted: true,
  title: 'video1',
  videoContent: {
    __typename: 'VideoArclight',
    // This is the redirected URL from this link which is handled at the backend.
    // https://arc.gt/hls/${mediaComponentId}/${languageId} => https://arc.gt/hls/2_0-FallingPlates/529
    // Meaning that it's expected for it's tokens key and this link to expire
    src: 'https://manifest.prod.boltdns.net/manifest/v1/hls/v4/clear/1226740748001/f31e0685-c9e6-4afb-9ed5-987b4c0ccde9/10s/master.m3u8?fastly_token=NjE4MzM0ODRfMDYxY2IzMzdmOWE0ODQ5MmI1ZDc0NDg0YWJmNjU3NWRlNTRmYmMwNjM1Y2NjNmM4YTU4Zjk4M2RhYmQxYjM2MQ%3D%3D'
  },
  startAt: null,
  endAt: null,
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

export const ArclightSource = Template.bind({})
ArclightSource.args = {
  blocks: conductorProps([videoBlock])
}

export const ExternalSource = Template.bind({})
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

export const StartAt = Template.bind({})
StartAt.args = {
  blocks: conductorProps([
    {
      ...videoBlock,
      startAt: 20
    }
  ])
}

export default Demo as Meta
