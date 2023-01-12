import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { watchConfig } from '../../libs/storybook'
import { videos } from '../Videos/testData'
import { GET_VIDEOS, VideosPage } from './VideosPage'

const VideosStory = {
  ...watchConfig,
  component: VideosPage,
  title: 'Watch/VideosPage'
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
              videos
            }
          }
        }
      ]}
    >
      <VideosPage />
    </MockedProvider>
  )
}

export const Default = Template.bind({})
Default.args = {
  limit: 20
}

export default VideosStory as Meta
