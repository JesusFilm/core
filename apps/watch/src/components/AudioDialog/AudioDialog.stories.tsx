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
  const slug = 'the-story-of-jesus-for-children/english'

  return (
    <MockedProvider
      mocks={[
        {
          request: {
            query: GET_VIDEO_LANGUAGES,
            variables: {
              id: slug
            }
          },
          result: {
            data: {
              video: {
                id: '1_jf-0-0',
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
                variantLanguagesWithSlug: [
                  {
                    slug: 'the-story-of-jesus-for-children/english',
                    language: {
                      id: '529',
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
                  {
                    slug: 'the-story-of-jesus-for-children/french',
                    language: {
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
                    }
                  },
                  {
                    slug: 'the-story-of-jesus-for-children/Deutsch',
                    language: {
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
                  }
                ]
              }
            }
          }
        }
      ]}
    >
      <AudioDialog slug={slug} open={open} onClose={() => setOpen(false)} />
    </MockedProvider>
  )
}

export const Default = Template.bind({})

export default AudioDialogStory as Meta
