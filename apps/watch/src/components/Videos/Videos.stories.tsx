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
      <Videos />
    </MockedProvider>
  )
}

export const Default = Template.bind({})
Default.args = {
  limit: 20
}

export default VideosStory as Meta
