import { ComponentProps } from 'react'
import { Story, Meta } from '@storybook/react'
import { watchConfig } from '../../libs/storybook'
import { videos } from '../Videos/testData'
import { VideoContainer } from '.'

const VideoContainerStory = {
  ...watchConfig,
  component: VideoContainer,
  title: 'Watch/VideoContainer'
}

const Template: Story<ComponentProps<typeof VideoContainer>> = ({
  ...args
}) => <VideoContainer {...args} />

export const Default = Template.bind({})
Default.args = {
  content: videos[0]
}

export const WithContainer = Template.bind({})
WithContainer.args = {
  container: videos[0],
  content: {
    ...videos[0].children[0],
    description: [{ __typename: 'Translation', value: 'video description' }]
  }
}

export default VideoContainerStory as Meta
