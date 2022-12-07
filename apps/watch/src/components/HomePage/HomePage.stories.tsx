import { ComponentProps } from 'react'
import { Story, Meta } from '@storybook/react'
import { watchConfig } from '../../libs/storybook'
import { videos } from '../VideosPage/testData'
import { HomePage } from '.'

const VideoContainerPageStory = {
  ...watchConfig,
  component: HomePage,
  title: 'Watch/HomePage',
  parameters: {
    ...watchConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: Story<ComponentProps<typeof HomePage>> = ({ ...args }) => (
  <HomePage {...args} />
)

export const Default = Template.bind({})
Default.args = {
  videos
}

export default VideoContainerPageStory as Meta
