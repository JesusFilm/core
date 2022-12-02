import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { watchConfig } from '../../libs/storybook'
import { videos } from './testData'
import { GET_VIDEOS, Videos } from './Videos'

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
