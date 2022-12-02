import { MockedProvider } from '@apollo/client/testing'
import { useState } from 'react'
import { Meta, Story } from '@storybook/react'
import { watchConfig } from '../../libs/storybook'
import { GET_VIDEO_LANGUAGES } from './AudioDialog'
import { AudioDialog } from '.'

const AudioDialogStory = {
  ...watchConfig,
  component: AudioDialog,
  title: 'Watch/AudioDialog'
}

const Template: Story = () => {
  const [open, setOpen] = useState(true)

  return (
    <MockedProvider
      mocks={[
        {
          request: {
            query: GET_VIDEO_LANGUAGES,
            variables: {
              id: '1_jf-0-0',
              languageId: '529'
            }
          },
          result: {
            data: {
              video: {
                id: '1_jf-0-0',
                slug: [
                  {
                    value: 'the-story-of-jesus-for-children',
                    __typename: 'Translation'
                  }
                ],
                variant: {
                  id: '529',
                  language: {
                    __typename: 'Language',
                    name: [
                      {
                        value: 'English',
                        primary: true,
                        __typename: 'Translation'
                      }
                    ]
                  }
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
              }
            }
          }
        }
      ]}
    >
      <AudioDialog open={open} onClose={() => setOpen(false)} />
    </MockedProvider>
  )
}

export const Default = Template.bind({})

export default AudioDialogStory as Meta
