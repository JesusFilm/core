import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { ComponentProps } from 'react'
import { watchConfig } from '../../../libs/storybook'
import { VideoLabel } from '../../../../__generated__/globalTypes'
import { CarouselItem } from './CarouselItem'

const CarouselItemStory = {
  ...watchConfig,
  component: CarouselItem,
  title: 'Watch/Video/CarouselItem'
}

const Template: Story<ComponentProps<typeof CarouselItem>> = ({ ...args }) => {
  return (
    <MockedProvider>
      <CarouselItem
        title={args.title}
        image={args.image}
        imageAlt={args.imageAlt}
        variant={args.variant}
        index={args.index}
        label={args.label}
        isPlaying={args.isPlaying}
        onClick={() => console.log('clicked')}
      />
    </MockedProvider>
  )
}

export const Item = Template.bind({})
Item.args = {
  label: VideoLabel.segment,
  title: [{ __typename: 'Translation', value: 'The Beginning' }],
  image:
    'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6101-0-0.mobileCinematicHigh.jpg',
  imageAlt: [{ __typename: 'Translation', value: 'JESUS' }],
  index: 5,
  isPlaying: true,
  variant: {
    duration: 488
  }
}

export const ItemLoading = Template.bind({})
ItemLoading.args = {
  label: VideoLabel.episode,
  title: [{ __typename: 'Translation', value: 'The Beginning' }],
  image: null,
  imageAlt: [{ __typename: 'Translation', value: 'JESUS' }],
  index: 5,
  isPlaying: true,
  variant: {
    duration: 488
  }
}

export const ItemPlaying = Template.bind({})
ItemPlaying.args = {
  label: VideoLabel.featureFilm,
  title: [{ __typename: 'Translation', value: 'The Beginning' }],
  image:
    'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6101-0-0.mobileCinematicHigh.jpg',
  imageAlt: [{ __typename: 'Translation', value: 'JESUS' }],
  index: 5,
  isPlaying: false,
  variant: {
    duration: 488
  }
}

export default CarouselItemStory as Meta
