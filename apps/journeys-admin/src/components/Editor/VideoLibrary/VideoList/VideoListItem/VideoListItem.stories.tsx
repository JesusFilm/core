import { Story, Meta } from '@storybook/react'
import { journeysAdminConfig } from '../../../../../libs/storybook'
import { VideoListItem } from '.'

const VideoListItemStory = {
  ...journeysAdminConfig,
  component: VideoListItem,
  title: 'Journeys-Admin/Editor/VideoLibrary/VideoList/VideoListItem'
}

const Template: Story = ({ ...args }) => (
  <VideoListItem
    title={args.title}
    description={args.description}
    poster={args.poster}
    time={args.time}
    language={args.language}
  />
)

export const Default = Template.bind({})
Default.args = {
  title: 'NUA - Episode: Fact or Fiction',
  description: 'This is a short description for the video nua1',
  poster:
    'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1631&q=80',
  time: 94000,
  language: ''
}

export default VideoListItemStory as Meta
