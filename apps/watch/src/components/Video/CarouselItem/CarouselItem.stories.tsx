import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { watchConfig } from '../../../libs/storybook'
import { VideoLabel } from '../../../../__generated__/globalTypes'
import { CarouselItem } from './CarouselItem'

const CarouselItemStory = {
  ...watchConfig,
  component: CarouselItem,
  title: 'Watch/Video/CarouselItem'
}

const Template: Story = ({ ...args }) => {
  return (
    <MockedProvider>
      <CarouselItem
        title={args.title}
        image={args.image}
        variant={args.variant}
        index={args.index}
        label={args.label}
        isPlaying={args.playing}
        onClick={() => console.log('clicked')}
      />
    </MockedProvider>
  )
}

export const Item = Template.bind({})
Item.args = {
  __typename: 'Video',
  id: '1_jf6101-0-0',
  label: VideoLabel.segment,
  title: [{ __typename: 'Translation', value: 'The Beginning' }],
  image:
    'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6101-0-0.mobileCinematicHigh.jpg',
  imageAlt: [{ __typename: 'Translation', value: 'The Beginning' }],
  index: 5,
  playing: true,
  snippet: [
    {
      __typename: 'Translation',
      value:
        'The story of Jesus fits within the larger story of the Judeo Christian tradition. The purpose of everything since creation has been to point to the life of Jesus.'
    }
  ],
  slug: 'the-beginning',
  children: [],
  variant: {
    __typename: 'VideoVariant',
    id: '1_529-jf6101-0-0',
    duration: 488,
    hls: 'https://arc.gt/pm6g1',
    slug: 'the-beginning/english'
  }
}

export const ItemLoading = Template.bind({})
ItemLoading.args = {
  __typename: 'Video',
  id: '1_jf6101-0-0',
  label: VideoLabel.episode,
  title: [{ __typename: 'Translation', value: 'The Beginning' }],
  image: '',
  imageAlt: [{ __typename: 'Translation', value: 'The Beginning' }],
  index: 5,
  playing: true,
  snippet: [
    {
      __typename: 'Translation',
      value:
        'The story of Jesus fits within the larger story of the Judeo Christian tradition. The purpose of everything since creation has been to point to the life of Jesus.'
    }
  ],
  slug: 'the-beginning',
  children: [],
  variant: {
    __typename: 'VideoVariant',
    id: '1_529-jf6101-0-0',
    duration: 488,
    hls: 'https://arc.gt/pm6g1',
    slug: 'the-beginning/english'
  }
}

export const ItemPlaying = Template.bind({})
ItemPlaying.args = {
  __typename: 'Video',
  id: '1_jf6101-0-0',
  label: VideoLabel.featureFilm,
  title: [{ __typename: 'Translation', value: 'The Beginning' }],
  image:
    'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6101-0-0.mobileCinematicHigh.jpg',
  imageAlt: [{ __typename: 'Translation', value: 'The Beginning' }],
  index: 5,
  playing: false,
  snippet: [
    {
      __typename: 'Translation',
      value:
        'The story of Jesus fits within the larger story of the Judeo Christian tradition. The purpose of everything since creation has been to point to the life of Jesus.'
    }
  ],
  slug: 'the-beginning',
  children: [],
  variant: {
    __typename: 'VideoVariant',
    id: '1_529-jf6101-0-0',
    duration: 488,
    hls: 'https://arc.gt/pm6g1',
    slug: 'the-beginning/english'
  }
}

export default CarouselItemStory as Meta
