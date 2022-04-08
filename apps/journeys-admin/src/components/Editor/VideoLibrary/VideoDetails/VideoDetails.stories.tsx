import { Story, Meta } from '@storybook/react'
import { useState } from 'react'
import { MockedProvider } from '@apollo/client/testing'
import { journeysAdminConfig } from '../../../../libs/storybook'
import { GET_LANGUAGES } from '../LanguageFilter/Drawer/Drawer'
import { ApolloLoadingProvider } from '../../../../../test/ApolloLoadingProvider'
import { GET_VIDEO } from './VideoDetails'
import { VideoDetails } from '.'

const VideoDetailsStory = {
  ...journeysAdminConfig,
  component: VideoDetails,
  title: 'Journeys-Admin/Editor/VideoLibrary/VideoDetails',
  argTypes: { onSelect: { action: 'clicked' } }
}

const Template: Story = ({ id, onSelect }) => {
  const [open, setOpen] = useState(true)

  return (
    <MockedProvider
      mocks={[
        {
          request: {
            query: GET_VIDEO,
            variables: {
              id: '2_Acts7302-0-0'
            }
          },
          result: {
            data: {
              video: {
                id: '2_Acts7302-0-0',
                image:
                  'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7302-0-0.mobileCinematicHigh.jpg',
                primaryLanguageId: '529',
                title: [
                  {
                    primary: true,
                    value: 'Jesus Taken Up Into Heaven'
                  }
                ],
                description: [
                  {
                    primary: true,
                    value:
                      'Jesus promises the Holy Spirit; then ascends into the clouds.'
                  }
                ],
                variant: {
                  id: 'variantA',
                  duration: 144,
                  hls: 'https://arc.gt/opsgn'
                }
              }
            }
          }
        },
        {
          request: {
            query: GET_LANGUAGES,
            variables: {
              languageId: '529'
            }
          },
          result: {
            data: {
              languages: [
                {
                  id: '529',
                  name: [
                    {
                      value: 'English',
                      primary: true
                    }
                  ]
                },
                {
                  id: '496',
                  name: [
                    {
                      value: 'Français',
                      primary: true
                    },
                    {
                      value: 'French',
                      primary: false
                    }
                  ]
                },
                {
                  id: '1106',
                  name: [
                    {
                      value: 'Deutsch',
                      primary: true
                    },
                    {
                      value: 'German, Standard',
                      primary: false
                    }
                  ]
                }
              ]
            }
          }
        }
      ]}
    >
      <VideoDetails
        id={id}
        open={open}
        onClose={() => setOpen(false)}
        onSelect={onSelect}
      />
    </MockedProvider>
  )
}

export const Default = Template.bind({})
Default.args = {
  id: '2_Acts7302-0-0'
}

export const Loading: Story = ({ id, onSelect }) => {
  const [open, setOpen] = useState(true)

  return (
    <ApolloLoadingProvider>
      <VideoDetails
        id={id}
        open={open}
        onClose={() => setOpen(false)}
        onSelect={onSelect}
      />
    </ApolloLoadingProvider>
  )
}
Loading.args = {
  id: '2_Acts7302-0-0'
}

export default VideoDetailsStory as Meta
