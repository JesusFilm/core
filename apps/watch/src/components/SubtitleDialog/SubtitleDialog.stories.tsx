import { ComponentProps } from 'react'
import { Story, Meta } from '@storybook/react'
import { noop } from 'lodash'
import { VideoProvider } from '../../libs/videoContext'
import { watchConfig } from '../../libs/storybook'
import { VideoFields } from '../../libs/videoContext/VideoContext'
import { videos } from '../Videos/testData'
import { SubtitleDialog } from './SubtitleDialog'

const video: VideoFields = videos[0]

const SubtitleDialogStory = {
  ...watchConfig,
  component: SubtitleDialog,
  title: 'Watch/SubtitleDialog',
  parameters: {
    theme: 'light'
  }
}

const Template: Story<
  ComponentProps<typeof SubtitleDialog> & { video: VideoFields }
> = ({ ...args }) => {
  return (
    <VideoProvider value={{ content: args.video }}>
      <SubtitleDialog {...args} />
    </VideoProvider>
  )
}

export const Basic = Template.bind({})
Basic.args = {
  open: true,
  onClose: noop,
  subtitles: video.variant?.subtitle
}

export default SubtitleDialogStory as Meta
