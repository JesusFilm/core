import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { journeysAdminConfig } from '../../../../libs/storybook'
import { ApolloLoadingProvider } from '../../../../../test/ApolloLoadingProvider'
import { GET_VIDEOS } from './VideoList'
import { videos } from './VideoListData'
import { VideoList } from '.'

const VideoListStory = {
  ...journeysAdminConfig,
  component: VideoList,
  title: 'Journeys-Admin/Editor/VideoLibrary/VideoList',
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
    <VideoList onSelect={onSelect} currentLanguageIds={['529']} />
  </MockedProvider>
)

export const Default = Template.bind({})

export const Loading: Story = ({ onSelect }) => {
  return (
    <ApolloLoadingProvider>
      <VideoList onSelect={onSelect} currentLanguageIds={['529']} />
    </ApolloLoadingProvider>
  )
}

export default VideoListStory as Meta
