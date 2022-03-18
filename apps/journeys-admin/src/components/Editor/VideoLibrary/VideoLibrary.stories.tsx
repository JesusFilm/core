import { Story, Meta } from '@storybook/react'
import { useState } from 'react'
import { MockedProvider } from '@apollo/client/testing'
import { journeysAdminConfig } from '../../../libs/storybook'
import { videos } from './VideoList/VideoListData'
import { GET_VIDEOS } from './VideoList/VideoList'
import { VideoLibrary } from '.'

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

const Search: Story = ({ onSelect }) => {
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
                title: 'Andreas'
              }
            }
          },
          result: {
            data: {
              videos: [
                {
                  id: '2_0-AndreasStory',
                  image:
                    'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_AndreasStory-0-0.mobileCinematicHigh.jpg',
                  snippet: [
                    {
                      primary: true,
                      value:
                        'After living a life full of fighter planes and porsches, Andreas realizes something is missing.'
                    }
                  ],
                  title: [
                    {
                      primary: true,
                      value: "Andreas' Story"
                    }
                  ],
                  variant: {
                    duration: 186
                  }
                }
              ]
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

export const SearchByTitleAndreas = Search.bind({})

export default VideoLibraryStory as Meta
