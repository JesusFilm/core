import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'

import { watchConfig } from '../../libs/storybook'
import { videos } from '../Videos/__generated__/testData'

import { GET_VIDEOS, VideosPage } from './VideosPage'
import { ComponentProps } from 'react'

const VideosStory: Meta<typeof VideosPage> = {
  ...watchConfig,
  component: VideosPage,
  title: 'Watch/VideosPage'
}

const Template: StoryObj<
  ComponentProps<typeof VideosPage> & { limit: number }
> = {
  render: ({ ...args }) => {
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
        <VideosPage videos={videos} />
      </MockedProvider>
    )
  }
}

export const Default = {
  ...Template,
  args: {
    limit: 20
  }
}

export default VideosStory
