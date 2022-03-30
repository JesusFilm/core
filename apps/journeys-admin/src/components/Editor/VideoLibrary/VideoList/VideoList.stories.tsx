import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { journeysAdminConfig } from '../../../../libs/storybook'
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
