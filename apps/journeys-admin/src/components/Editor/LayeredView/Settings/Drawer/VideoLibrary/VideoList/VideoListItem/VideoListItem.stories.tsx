import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/nextjs'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { VideoBlockSource } from '../../../../../../../../../__generated__/globalTypes'

import { VideoListItem } from '.'

const VideoListItemStory: Meta<typeof VideoListItem> = {
  ...journeysAdminConfig,
  component: VideoListItem,
  title:
    'Journeys-Admin/Editor/Slider/Settings/Drawer/VideoLibrary/VideoList/VideoListItem',
  argTypes: { onSelect: { action: 'clicked' } }
}

const Template: StoryObj<typeof VideoListItem> = {
  render: ({ onSelect, ...args }) => (
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
}

export const Default = {
  ...Template,
  args: {
    id: '2_0-AndreasStory',
    title: "Andreas' Story",
    description:
      'After living a life full of fighter planes and porsches, Andreas realizes something is missing.',
    image:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_AndreasStory-0-0.mobileCinematicHigh.jpg',
    duration: 186,
    source: VideoBlockSource.internal
  }
}

export default VideoListItemStory
