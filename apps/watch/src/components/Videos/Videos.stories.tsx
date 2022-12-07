import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { watchConfig } from '../../libs/storybook'
import { CarouselItem } from '../Video/CarouselItem'
import { videos } from './testData'
import { GET_VIDEOS, Videos } from './Videos'

const VideosStory = {
  ...watchConfig,
  component: Videos,
  title: 'Watch/Videos',
  argTypes: {
    fetchMore: { action: 'fetched more' }
  }
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
              offset: 0,
              limit: args.limit ?? undefined,
              languageId: '529'
            }
          },
          result: {
            data: {
              videos: videos.slice(0, args.limit)
            }
          }
        }
      ]}
    >
      <Videos
        renderItem={(props: Parameters<typeof CarouselItem>[0]) => (
          <CarouselItem {...props} />
        )}
        filter={{ availableVariantLanguageIds: ['529'] }}
        limit={args.limit ?? undefined}
        layout={args.layout}
      />
    </MockedProvider>
  )
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
