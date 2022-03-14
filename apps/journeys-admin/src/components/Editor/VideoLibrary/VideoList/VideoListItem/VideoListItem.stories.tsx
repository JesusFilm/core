import { Story, Meta } from '@storybook/react'
import { journeysAdminConfig } from '../../../../../libs/storybook'
import { VideoListItem } from '.'

const VideoListItemStory = {
  ...journeysAdminConfig,
  component: VideoListItem,
  title: 'Journeys-Admin/Editor/VideoLibrary/VideoList/VideoListItem',
  argTypes: { onSelect: { action: 'clicked' } }
}

const Template: Story = ({ onSelect, ...args }) => (
  <VideoListItem
    id={args.id}
    title={args.title}
    description={args.description}
    image={args.image}
    duration={args.duration}
    onSelect={onSelect}
  />
)

export const Default = Template.bind({})
Default.args = {
  id: '2_0-AndreasStory',
  title: "Andreas' Story",
  description:
    'After living a life full of fighter planes and porsches, Andreas realizes something is missing.',
  image:
    'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_AndreasStory-0-0.mobileCinematicHigh.jpg',
  duration: 186
}

export default VideoListItemStory as Meta
