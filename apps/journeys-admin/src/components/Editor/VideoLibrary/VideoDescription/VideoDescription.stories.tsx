import { ComponentProps, useState } from 'react'
import { MockedProvider } from '@apollo/client/testing'
import { Meta, Story } from '@storybook/react'
import { VideoBlockSource } from '../../../../../__generated__/globalTypes'
import { journeysAdminConfig } from '../../../../libs/storybook'
import { GET_VIDEO } from '../VideoFromLocal/LocalDetails/LocalDetails'
import { VideoDetails } from '../VideoDetails'
import { VideoDescription } from './VideoDescription'

const VideoDescriptionStory = {
  ...journeysAdminConfig,
  component: VideoDescription,
  title: 'Journeys-Admin/Editor/VideoLibrary/VideoDetails/VideoDescription',
  argTypes: { onSelect: { action: 'clicked' } }
}

const Template: Story<
  ComponentProps<typeof VideoDetails> & { videoDescription: string }
> = ({ id, onSelect, activeVideo, videoDescription }) => {
  const [open, setOpen] = useState(true)
  return (
    <MockedProvider
      mocks={[
        {
          request: {
            query: GET_VIDEO,
            variables: {
              id: '2_Acts7302-0-0',
              languageId: '529'
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
                    value: videoDescription
                  }
                ],
                variant: {
                  id: 'variantA',
                  duration: 144,
                  hls: 'https://arc.gt/opsgn'
                },
                variantLanguages: [
                  {
                    __typename: 'Language',
                    id: '529',
                    name: [
                      {
                        value: 'English',
                        primary: true,
                        __typename: 'Translation'
                      }
                    ]
                  }
                ]
              }
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
        source={VideoBlockSource.internal}
        activeVideo={activeVideo}
      />
    </MockedProvider>
  )
}

export const Default = Template.bind({})
Default.args = {
  id: '2_Acts7302-0-0',
  activeVideo: true,
  videoDescription:
    'Jesus promises the Holy Spirit; then ascends into the clouds. This description is set long on purpose to showcase the functinality of the "More" and "Less" buttons.'
}

export default VideoDescriptionStory as Meta
