import { Story, Meta } from '@storybook/react'
import { journeysAdminConfig } from '../../../../libs/storybook'
import { VideoList } from '.'
import { MockedProvider } from '@apollo/client/testing'
import { GET_VIDEOS } from './VideoList'
import { videos } from './VideoListData'

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
            where: {
              availableVariantLanguageIds: ['529'],
              title: null
            }
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
    <VideoList onSelect={onSelect} currentLanguageIds={['529']} />
  </MockedProvider>
)

export const Default = Template.bind({})

export default VideoListStory as Meta
