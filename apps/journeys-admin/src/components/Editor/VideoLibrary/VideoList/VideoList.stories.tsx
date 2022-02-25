import { Story, Meta } from '@storybook/react'
import { journeysAdminConfig } from '../../../../libs/storybook'
import { VideoList } from '.'

const VideoListStory = {
  ...journeysAdminConfig,
  component: VideoList,
  title: 'Journeys-Admin/Editor/VideoLibrary/VideoList'
}

const Template: Story = () => <VideoList />
export const Default = Template.bind({})

export default VideoListStory as Meta
