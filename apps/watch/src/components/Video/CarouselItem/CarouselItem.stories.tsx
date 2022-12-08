import { Story, Meta } from '@storybook/react'
import { ComponentProps } from 'react'
import { watchConfig } from '../../../libs/storybook'
import { VideoLabel } from '../../../../__generated__/globalTypes'
import { VideoContentFields } from '../../../../__generated__/VideoContentFields'
import { videos } from '../../Videos/testData'
import { VideoProvider } from '../../../libs/videoContext'
import { CarouselItem } from './CarouselItem'

const CarouselItemStory = {
  ...watchConfig,
  component: CarouselItem,
  title: 'Watch/Video/CarouselItem'
}

const chapter1: VideoContentFields = {
  __typename: 'Video',
  id: '1_jf6101-0-0',
  label: VideoLabel.segment,
  image:
    'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6101-0-0.mobileCinematicHigh.jpg',
  imageAlt: [{ __typename: 'Translation', value: 'The Beginning' }],
  snippet: [
    {
      __typename: 'Translation',
      value:
        'The story of Jesus fits within the larger story of the Judeo Christian tradition. The purpose of everything since creation has been to point to the life of Jesus.'
    }
  ],
  description: [
    {
      __typename: 'Translation',
      value:
        'The story of Jesus fits within the larger story of the Judeo Christian tradition. The purpose of everything since creation has been to point to the life of Jesus.\n\nAll of creation speaks of the majesty of God. As God created man and woman he intended them to live in peace with him forever. But because of their disobedience mankind was separated from God. But God still loved mankind so throughout the Scriptures God reveals his plan to save the world.'
    }
  ],
  studyQuestions: [],
  title: [{ __typename: 'Translation', value: 'The Beginning' }],
  variant: {
    __typename: 'VideoVariant',
    id: '1_529-jf6101-0-0',
    duration: 488,
    hls: 'https://arc.gt/pm6g1',
    language: {
      __typename: 'Language',
      id: '529',
      name: [{ __typename: 'Translation', value: 'English' }]
    },
    slug: 'the-beginning/english'
  },
  slug: 'the-beginning',
  children: []
}

const chapter2: VideoContentFields = {
  __typename: 'Video',
  id: '1_jf6101-0-0',
  label: VideoLabel.episode,
  image: null,
  imageAlt: [{ __typename: 'Translation', value: 'The Beginning' }],
  snippet: [
    {
      __typename: 'Translation',
      value:
        'The story of Jesus fits within the larger story of the Judeo Christian tradition. The purpose of everything since creation has been to point to the life of Jesus.'
    }
  ],
  description: [
    {
      __typename: 'Translation',
      value:
        'The story of Jesus fits within the larger story of the Judeo Christian tradition. The purpose of everything since creation has been to point to the life of Jesus.\n\nAll of creation speaks of the majesty of God. As God created man and woman he intended them to live in peace with him forever. But because of their disobedience mankind was separated from God. But God still loved mankind so throughout the Scriptures God reveals his plan to save the world.'
    }
  ],
  studyQuestions: [],
  title: [{ __typename: 'Translation', value: 'The Beginning' }],
  variant: {
    __typename: 'VideoVariant',
    id: '1_529-jf6101-0-0',
    duration: 488,
    hls: 'https://arc.gt/pm6g1',
    language: {
      __typename: 'Language',
      id: '529',
      name: [{ __typename: 'Translation', value: 'English' }]
    },
    slug: 'the-beginning/english'
  },
  slug: 'the-beginning',
  children: []
}

const Template: Story<ComponentProps<typeof CarouselItem>> = ({ ...args }) => {
  return (
    <VideoProvider
      value={{
        content: chapter1,
        container: videos[0]
      }}
    >
      <CarouselItem
        index={args.index}
        isPlaying={args.isPlaying}
        onClick={() => console.log('clicked')}
      />
    </VideoProvider>
  )
}

const Template2: Story<ComponentProps<typeof CarouselItem>> = ({ ...args }) => {
  return (
    <VideoProvider
      value={{
        content: chapter2,
        container: videos[0]
      }}
    >
      <CarouselItem
        index={args.index}
        isPlaying={args.isPlaying}
        onClick={() => console.log('clicked')}
      />
    </VideoProvider>
  )
}

export const Item = Template.bind({})
Item.args = {
  index: 5,
  isPlaying: false
}

export const ItemLoading = Template2.bind({})
ItemLoading.args = {
  index: 5,
  isPlaying: false
}

export const ItemPlaying = Template.bind({})
ItemPlaying.args = {
  index: 5,
  isPlaying: true
}

export default CarouselItemStory as Meta
