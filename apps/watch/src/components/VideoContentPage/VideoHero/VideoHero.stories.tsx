import { Meta, Story } from '@storybook/react'
import { screen, userEvent } from '@storybook/testing-library'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeName, ThemeMode } from '@core/shared/ui/themes'
import { MockedProvider } from '@apollo/client/testing'
import { watchConfig } from '../../../libs/storybook'
import { VideoProvider } from '../../../libs/videoContext'
import { videos } from '../../Videos/testData'
import { GET_VIDEO_LANGUAGES } from '../AudioLanguageButton'
import { VideoHero } from './VideoHero'

import '../../../../public/styles/video-js.css'

const VideoHeroStory = {
  ...watchConfig,
  component: VideoHero,
  title: 'Watch/VideoContentPage/VideoHero'
}

const Template: Story = () => (
  <ThemeProvider themeName={ThemeName.website} themeMode={ThemeMode.dark}>
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
        <VideoHero />
      </VideoProvider>
    </MockedProvider>
  </ThemeProvider>
)

export const Default = Template.bind({})

export const VideoPlayer = Template.bind({})
VideoPlayer.play = async () => {
  const CustomPlayButton = screen.getAllByRole('button')[0]
  userEvent.click(CustomPlayButton)
}

export default VideoHeroStory as Meta
