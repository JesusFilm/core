import { Meta, Story } from '@storybook/react'
import { screen, userEvent } from '@storybook/testing-library'

import { watchConfig } from '../../../libs/storybook'
import { VideoProvider } from '../../../libs/videoContext'
import { videos } from '../../Videos/__generated__/testData'

import { VideoContent } from './VideoContent'

const VideoContentStory = {
  ...watchConfig,
  component: VideoContent,
  title: 'Watch/VideoContentPage/VideoContent'
}

const Template: Story = (args) => (
  <VideoProvider value={{ content: args.video }}>
    <VideoContent />
  </VideoProvider>
)

export const Default = Template.bind({})
Default.args = {
  video: { ...videos[0], studyQuestions: [] }
}

export const Discussion = Template.bind({})
Discussion.args = {
  video: { ...videos[0] }
}
Discussion.play = () => {
  userEvent.click(screen.getByTestId('discussion'))
}

export default VideoContentStory as Meta
