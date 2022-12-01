import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { watchConfig } from '../../libs/storybook'
import { videos } from './testData'
import { GET_VIDEOS, Videos } from './Videos'
import { CarouselVideo } from './VideosCarousel/CarouselThumbnail/CarouselVideo'

const VideosStory = {
  ...watchConfig,
  component: Videos,
  title: 'Watch/Videos'
}

const Template: Story = ({ ...args }) => {
  return (
    <MockedProvider
      mocks={[
        {
          request: {
            query: GET_VIDEOS,
            variables: {
              where: {
                availableVariantLanguageIds: ['529']
              },
              page: 1,
              limit: args.limit
            }
          },
          result: {
            data: {
              videos: videos
            }
          }
        }
      ]}
    >
      <Videos
        filter={{ availableVariantLanguageIds: ['529'] }}
        layout={args.layout}
        variant={args.variant}
      />
    </MockedProvider>
  )
}

const Tester: Story = ({ ...args }) => {
  return (    
    <CarouselVideo
      title={args.title}
      image={args.image}
      variant={args.variant}
      isPlaying
      onClick={() => {console.log("clicked it")}}
    />
  )
}

export const CarouselVideoTest = Tester.bind({})
CarouselVideoTest.args = {
  title: [{value: 'Testing'}],
  image: 'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_cl-0-0.mobileCinematicHigh.jpg',
  variant: { duration: 3680, __typename: 'VideoVariant' }
}

export const Carousel = Template.bind({})
Carousel.args = {
  layout: 'carousel',
  limit: 8
}

export const Grid = Template.bind({})
Grid.args = {
  layout: 'grid',
  limit: 20
}

export default VideosStory as Meta
