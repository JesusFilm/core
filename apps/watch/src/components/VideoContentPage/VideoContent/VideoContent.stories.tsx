import { Meta, StoryObj } from '@storybook/react'
import { screen, userEvent } from '@storybook/testing-library'

import { videos } from '@core/watch/ui/testDataGenerator/__generated__/testData'

import { watchConfig } from '../../../libs/storybook'
import { VideoProvider } from '../../../libs/videoContext'

import { VideoContent } from './VideoContent'

const VideoContentStory: Meta<typeof VideoContent> = {
  ...watchConfig,
  component: VideoContent,
  title: 'Watch/VideoContentPage/VideoContent'
}

const Template: StoryObj<typeof VideoContent> = {
  render: ({ ...args }) => (
    <VideoProvider value={{ content: args.video }}>
      <VideoContent />
    </VideoProvider>
  )
}

export const Default = {
  ...Template,
  args: {
    video: { ...videos[0], studyQuestions: [] }
  }
}

export const Discussion = {
  ...Template,
  args: {
    video: { ...videos[0] }
  },
  play: async () => {
    await userEvent.click(screen.getByTestId('discussion'))
  }
}

export default VideoContentStory
