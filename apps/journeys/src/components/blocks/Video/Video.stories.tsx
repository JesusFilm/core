import { Story, Meta } from '@storybook/react'
import { Video } from '.'
import { TreeBlock } from '../../../libs/transformer/transformer'
import { journeysConfig } from '../../../libs/storybook'
import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../__generated__/GetJourney'

const Demo = {
  ...journeysConfig,
  component: Video,
  title: 'Journeys/Blocks/Video'
}

const Template: Story<TreeBlock<VideoBlock>> = ({ ...props }) => (
  <Video {...props} />
)

export const Default = Template.bind({})
Default.args = {
  __typename: 'VideoBlock',
  id: 'Video1',
  parentBlockId: '',
  volume: 1,
  autoplay: true,
  src: 'https://playertest.longtailvideo.com/adaptive/elephants_dream_v4/index.m3u8',
  parent: {
    id: 'Step1'
  }
}

export default Demo as Meta
