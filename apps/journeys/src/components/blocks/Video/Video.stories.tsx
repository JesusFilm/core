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

export const Default = Template.bind({})
Default.args = {
  __typename: 'VideoBlock',
  id: 'Video1',
  parentBlockId: '',
  volume: 1,
  autoplay: true,
  video: {
    mediaComponentId: '5_0-NUA0201-0-0',
    languageId: '529',
  }
}

export const Src = Template.bind({})
Src.args = {
  __typename: 'VideoBlock',
  id: 'Video1',
  parentBlockId: '',
  volume: 1,
  autoplay: true,
  videoSrc:
    'https://playertest.longtailvideo.com/adaptive/elephants_dream_v4/index.m3u8'
}

export const StartAt = Template.bind({})
StartAt.args = {
  __typename: 'VideoBlock',
  id: 'Video1',
  parentBlockId: '',
  volume: 1,
  autoplay: true,
  video: {
    src: 'https://arc.gt/hls/5_0-NUA0201-0-0/529'
  },
  startAt: 30
}

export default Demo as Meta
