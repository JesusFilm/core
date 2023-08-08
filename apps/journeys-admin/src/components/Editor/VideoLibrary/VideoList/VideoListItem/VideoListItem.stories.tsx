import { MockedProvider } from '@apollo/client/testing'
import { Meta, Story } from '@storybook/react'

import { VideoBlockSource } from '../../../../../../__generated__/globalTypes'
import { journeysAdminConfig } from '../../../../../libs/storybook'

import { VideoListItem } from '.'

const VideoListItemStory = {
  ...journeysAdminConfig,
  component: VideoListItem,
  title: 'Journeys-Admin/Editor/VideoLibrary/VideoList/VideoListItem',
  argTypes: { onSelect: { action: 'clicked' } }
}

const Template: Story = ({ onSelect, ...args }) => (
  <MockedProvider>
    <VideoListItem
      id={args.id}
      title={args.title}
      description={args.description}
      image={args.image}
      duration={args.duration}
      onSelect={onSelect}
      source={args.source}
    />
  </MockedProvider>
)

export const Default = Template.bind({})
Default.args = {
  id: '2_0-AndreasStory',
  title: "Andreas' Story",
  description:
    'After living a life full of fighter planes and porsches, Andreas realizes something is missing.',
  image:
    'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_AndreasStory-0-0.mobileCinematicHigh.jpg',
  duration: 186,
  source: VideoBlockSource.internal
}

export default VideoListItemStory as Meta
