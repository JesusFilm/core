import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { ApolloLoadingProvider } from '../../../../../../../../test/ApolloLoadingProvider'

import { GET_VIDEOS } from './VideoFromLocal'
import { videos } from './data'

import { VideoFromLocal } from '.'

const VideoFromLocalStory: Meta<typeof VideoFromLocal> = {
  ...journeysAdminConfig,
  component: VideoFromLocal,
  title:
    'Journeys-Admin/Editor/Slider/Settings/Drawer/VideoLibrary/VideoFromLocal',
  argTypes: { onSelect: { action: 'clicked' } }
}

const Template: StoryObj<typeof VideoFromLocal> = {
  render: ({ onSelect }) => (
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
}

export const Default = { ...Template }

export const Loading: StoryObj<typeof VideoFromLocal> = {
  render: ({ onSelect }) => {
    return (
      <ApolloLoadingProvider>
        <VideoFromLocal onSelect={onSelect} />
      </ApolloLoadingProvider>
    )
  }
}

export default VideoFromLocalStory
