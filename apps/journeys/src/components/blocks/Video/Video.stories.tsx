import { Story, Meta } from '@storybook/react'
import { Video, VIDEO_RESPONSE_CREATE } from '.'
import { TreeBlock } from '../../../libs/transformer/transformer'
import { journeysConfig, StoryCard } from '../../../libs/storybook'
import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../__generated__/GetJourney'
import { MockedProvider } from '@apollo/client/testing'
import { VideoResponseStateEnum } from '../../../../__generated__/globalTypes'

const Demo = {
  ...journeysConfig,
  component: Video,
  title: 'Journeys/Blocks/Video'
}

const Template: Story<TreeBlock<VideoBlock>> = ({ ...props }) => (
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
    <StoryCard>
      <Video {...props} />
    </StoryCard>
  </MockedProvider>
)

// add an active block around this for it to work

export const Default = Template.bind({})
Default.args = {
  __typename: 'VideoBlock',
  id: 'Video1',
  parentBlockId: 'step1.id',
  volume: 1,
  autoplay: true,
  muted: true,
  videoContent: {
    __typename: 'VideoArclight',
    src: 'https://manifest.prod.boltdns.net/manifest/v1/hls/v4/clear/1226740748001/23f84185-80ff-49bd-8dbb-75c53022daef/10s/master.m3u8?fastly_token=NjE4MGJkMzlfMDQ1OGE5MTNjNzAxODg4NGRiZjFlZGEyOTQwMzkxYjk0NjM4NDIzMjIxNDc0M2I5OGNjNzBlYWY3MzM2OTBlNw%3D%3D'
  }
}

export const Src = Template.bind({})
Src.args = {
  __typename: 'VideoBlock',
  id: 'video1.id',
  parentBlockId: 'step1.id',
  volume: 1,
  autoplay: true,
  videoContent: {
    __typename: 'VideoGeneric',
    src: 'https://playertest.longtailvideo.com/adaptive/elephants_dream_v4/index.m3u8'
  }
}

export const StartAt = Template.bind({})
StartAt.args = {
  __typename: 'VideoBlock',
  id: 'video1.id',
  parentBlockId: 'step1.id',
  volume: 1,
  autoplay: true,
  videoContent: {
    src: 'https://manifest.prod.boltdns.net/manifest/v1/hls/v4/clear/1226740748001/23f84185-80ff-49bd-8dbb-75c53022daef/10s/master.m3u8?fastly_token=NjE4MGJkMzlfMDQ1OGE5MTNjNzAxODg4NGRiZjFlZGEyOTQwMzkxYjk0NjM4NDIzMjIxNDc0M2I5OGNjNzBlYWY3MzM2OTBlNw%3D%3D'
  },
  startAt: 30
}

export default Demo as Meta
