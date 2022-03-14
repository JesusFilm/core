import { Story, Meta } from '@storybook/react'
import { useState } from 'react'
import { journeysAdminConfig } from '../../../libs/storybook'
import { VideoLibrary } from '.'
import { MockedProvider } from '@apollo/client/testing'
import { GET_VIDEOS } from './VideoList/VideoList'
import { videos } from './VideoList/VideoListData'

const VideoLibraryStory = {
  ...journeysAdminConfig,
  component: VideoLibrary,
  title: 'Journeys-Admin/Editor/VideoLibrary',
  argTypes: { onSelect: { action: 'clicked' } }
}

const Template: Story = ({ onSelect }) => {
  const [open, setOpen] = useState(true)

  return (
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
              videos: [...videos, ...videos, ...videos]
            }
          }
        }
      ]}
    >
      <VideoLibrary
        open={open}
        onClose={() => setOpen(false)}
        onSelect={onSelect}
      />
    </MockedProvider>
  )
}

export const Default = Template.bind({})

export default VideoLibraryStory as Meta
