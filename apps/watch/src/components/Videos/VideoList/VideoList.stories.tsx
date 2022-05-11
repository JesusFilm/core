import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { watchConfig } from '../../../libs/storybook'
import { videos } from './testData'
import { GET_VIDEOS, VideoList } from './VideoList'

const VideoListStory = {
  ...watchConfig,
  component: VideoList,
  title: 'Watch/Videos/VideoList'
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
      <VideoList
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

export const ListSmall = Template.bind({})
ListSmall.args = {
  layout: 'list',
  variant: 'small',
  limit: 8
}

export const ListLarge = Template.bind({})
ListLarge.args = {
  layout: 'list',
  variant: 'large',
  limit: 8
}

export default VideoListStory as Meta
