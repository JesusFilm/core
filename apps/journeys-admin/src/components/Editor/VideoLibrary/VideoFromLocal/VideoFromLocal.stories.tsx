import { MockedProvider } from '@apollo/client/testing'
import { Meta, Story } from '@storybook/react'

import { ApolloLoadingProvider } from '../../../../../test/ApolloLoadingProvider'
import { journeysAdminConfig } from '../../../../libs/storybook'

import { videos } from './data'
import { GET_VIDEOS } from './VideoFromLocal'

import { VideoFromLocal } from '.'

const VideoFromLocalStory = {
  ...journeysAdminConfig,
  component: VideoFromLocal,
  title: 'Journeys-Admin/Editor/VideoLibrary/VideoFromLocal',
  argTypes: { onSelect: { action: 'clicked' } }
}

const Template: Story = ({ onSelect }) => (
  <MockedProvider
    mocks={[
      {
        request: {
          query: GET_VIDEOS,
          variables: {
            offset: 0,
            limit: 5,
            where: {
              availableVariantLanguageIds: ['529'],
              title: null
            }
          }
        },
        result: {
          data: {
            videos
          }
        }
      },
      {
        request: {
          query: GET_VIDEOS,
          variables: {
            offset: 3,
            limit: 5,
            where: {
              availableVariantLanguageIds: ['529'],
              title: null
            }
          }
        },
        result: {
          data: {
            videos: []
          }
        }
      }
    ]}
  >
    <VideoFromLocal onSelect={onSelect} />
  </MockedProvider>
)

export const Default = Template.bind({})

export const Loading: Story = ({ onSelect }) => {
  return (
    <ApolloLoadingProvider>
      <VideoFromLocal onSelect={onSelect} />
    </ApolloLoadingProvider>
  )
}

export default VideoFromLocalStory as Meta
