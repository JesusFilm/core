import { ComponentProps } from 'react'
import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { watchConfig } from '../../libs/storybook'
import { VideoProvider } from '../../libs/videoContext'
import { videos } from '../Videos/testData'
import { GET_VIDEO_LANGUAGES } from './AudioLanguageButton'
import { VideoContentPage } from '.'

const VideoContentPageStory = {
  ...watchConfig,
  component: VideoContentPage,
  title: 'Watch/VideoContentPage',
  parameters: {
    ...watchConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: Story<ComponentProps<typeof VideoContentPage>> = ({
  ...args
}) => (
  <MockedProvider
    mocks={[
      {
        request: {
          query: GET_VIDEO_LANGUAGES,
          variables: {
            id: 'jesus/english'
          }
        },
        result: {
          data: {
            video: {
              id: '1_jf-0-0',
              variant: {
                id: '529',
                __typename: 'VideoVariant',
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
                  __typename: 'LanguageWithSlug',
                  slug: 'jesus/english',
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
                  __typename: 'LanguageWithSlug',
                  slug: 'jesus/french',
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
                  __typename: 'LanguageWithSlug',
                  slug: 'jesus/Deutsch',
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
    <VideoProvider value={{ content: videos[0] }}>
      <VideoContentPage {...args} />
    </VideoProvider>
  </MockedProvider>
)

export const Default = Template.bind({})

export default VideoContentPageStory as Meta
