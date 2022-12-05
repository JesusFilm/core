import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { watchConfig } from '../../libs/storybook'
import { CarouselItem } from './CarouselItem/CarouselItem'

const VideoStory = {
  ...watchConfig,
  component: CarouselItem,
  title: 'Watch/Video'
}

const Template: Story = ({ ...args }) => {
  return (
    <MockedProvider>
      <CarouselItem
        title={args.title}
        image={args.image}
        variant={args.variant}
        index={4}
        videoType="segment"
        isPlaying
        onClick={() => console.log('clicked')}
      />
    </MockedProvider>
  )
}

export const Item = Template.bind({})
Item.args = {
  title: [{ __typename: 'Translation', value: 'The Beginning' }],
  image:
    'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6101-0-0.mobileCinematicHigh.jpg',
  imageAlt: [{ __typename: 'Translation', value: 'The Beginning' }],
  variant: {
    __typename: 'VideoVariant',
    id: '1_529-jf6101-0-0',
    duration: 488,
    hls: 'https://arc.gt/pm6g1',
    slug: 'the-beginning/english'
  }
}

export default VideoStory as Meta
