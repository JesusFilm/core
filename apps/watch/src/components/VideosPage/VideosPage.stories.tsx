import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'
import algoliasearch from 'algoliasearch'
import { ComponentProps } from 'react'
import { InstantSearch } from 'react-instantsearch'

import { watchConfig } from '../../libs/storybook'
import { videos } from '../Videos/__generated__/testData'

import { GET_VIDEOS, VideosPage } from './VideosPage'

const VideosStory: Meta<typeof VideosPage> = {
  ...watchConfig,
  component: VideosPage,
  title: 'Watch/VideosPage'
}

const searchClient = algoliasearch('', '')

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
        <InstantSearch searchClient={searchClient} indexName="videos">
          <VideosPage localVideos={videos} />
        </InstantSearch>
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
