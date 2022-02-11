import { Story, Meta } from '@storybook/react'
import { journeyUiConfig, TreeBlock } from '@core/journeys/ui'
import { VideoFields } from '../../../../../__generated__/VideoFields'
import { VideoWrapper } from '.'

const VideoWrapperStory = {
  ...journeyUiConfig,
  component: VideoWrapper,
  title: 'Journeys-Admin/Editor/Canvas/VideoWrapper'
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
  fullsize: null,
  children: []
}

const Template: Story<TreeBlock<VideoFields>> = ({ ...props }) => {
  return <VideoWrapper block={props} />
}

export const Default = Template.bind({})
Default.args = {
  ...videoBlock
}

export default VideoWrapperStory as Meta
