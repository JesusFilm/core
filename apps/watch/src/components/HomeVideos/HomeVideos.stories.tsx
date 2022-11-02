import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { watchConfig } from '../../libs/storybook'
import { GET_VIDEOS } from '../Videos/Videos'
import { data, videos } from './testData'
import { HomeVideos } from './HomeVideos'

const HomeVideosStory = {
  ...watchConfig,
  component: HomeVideos,
  title: 'Watch/HomeVideos'
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
      <HomeVideos videos={videos} data={data} />
    </MockedProvider>
  )
}

export const Grid = Template.bind({})

export default HomeVideosStory as Meta
