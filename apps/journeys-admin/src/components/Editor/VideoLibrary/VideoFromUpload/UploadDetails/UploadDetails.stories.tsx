import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { journeysAdminConfig } from '../../../../../libs/storybook'
import { GetVideo_video_variantLanguages as Language } from '../../../../../../__generated__/GetVideo'
import { ApolloLoadingProvider } from '../../../../../../test/ApolloLoadingProvider'
import { GET_VIDEO } from './UploadDetails'
import { UploadDetails } from '.'

const UploadDetailsStory = {
  ...journeysAdminConfig,
  component: UploadDetails,
  title: 'Journeys-Admin/Editor/VideoLibrary/VideoFromUpload/UploadDetails',
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

const Template: Story = ({ id, onSelect }) => {
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
                    value:
                      'Jesus promises the Holy Spirit; then ascends into the clouds.'
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
      <UploadDetails id={id} open onSelect={onSelect} />
    </MockedProvider>
  )
}

export const Default = Template.bind({})
Default.args = {
  id: '2_Acts7302-0-0'
}

export const Loading: Story = ({ id, onSelect }) => {
  return (
    <ApolloLoadingProvider>
      <UploadDetails id={id} open onSelect={onSelect} />
    </ApolloLoadingProvider>
  )
}
Loading.args = {
  id: '2_Acts7302-0-0'
}

export default UploadDetailsStory as Meta
