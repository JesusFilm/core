import { Story, Meta } from '@storybook/react'
import { journeysAdminConfig } from '../../../../libs/storybook'
import { VideoList } from '.'

const VideoListStory = {
  ...journeysAdminConfig,
  component: VideoList,
  title: 'Journeys-Admin/Editor/VideoLibrary/VideoList'
}

const Template: Story = ({ ...args }) => <VideoList onSelect={args.onSelect} />
export const Default = Template.bind({
  onSelect: () => console.log('onSelect')
})

export default VideoListStory as Meta
