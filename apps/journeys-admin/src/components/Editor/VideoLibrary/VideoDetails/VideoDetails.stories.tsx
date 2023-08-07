import { MockedProvider } from '@apollo/client/testing'
import { Meta, Story } from '@storybook/react'
import { ComponentProps, useState } from 'react'

import { GetVideo_video_variantLanguages as Language } from '../../../../../__generated__/GetVideo'
import { VideoBlockSource } from '../../../../../__generated__/globalTypes'
import { ApolloLoadingProvider } from '../../../../../test/ApolloLoadingProvider'
import { journeysAdminConfig } from '../../../../libs/storybook'
import { GET_VIDEO } from '../VideoFromLocal/LocalDetails/LocalDetails'

import { VideoDetails } from '.'

const VideoDetailsStory = {
  ...journeysAdminConfig,
  component: VideoDetails,
  title: 'Journeys-Admin/Editor/VideoLibrary/VideoDetails',
  argTypes: { onSelect: { action: 'clicked' } }
}

const languages: Language[] = [
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
  },
  {
    id: '496',
    __typename: 'Language',
    name: [
      {
        value: 'Français',
        primary: true,
        __typename: 'Translation'
      },
      {
        value: 'French',
        primary: false,
        __typename: 'Translation'
      }
    ]
  },
  {
    id: '1106',
    __typename: 'Language',
    name: [
      {
        value: 'Deutsch',
        primary: true,
        __typename: 'Translation'
      },
      {
        value: 'German, Standard',
        primary: false,
        __typename: 'Translation'
      }
    ]
  }
]

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
                variantLanguages: languages
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
  videoDescription:
    'Jesus promises the Holy Spirit; then ascends into the clouds.'
}

export const LongDescription = Template.bind({})
LongDescription.args = {
  ...Default.args,
  videoDescription:
    'Jesus promises the Holy Spirit; then ascends into the clouds. This description is set long on purpose to showcase the functinality of the "More" and "Less" buttons.'
}

export const Selected = Template.bind({})
Selected.args = {
  ...Default.args,
  activeVideo: true
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
        source={VideoBlockSource.internal}
      />
    </ApolloLoadingProvider>
  )
}
Loading.args = {
  id: '2_Acts7302-0-0'
}

export default VideoDetailsStory as Meta
