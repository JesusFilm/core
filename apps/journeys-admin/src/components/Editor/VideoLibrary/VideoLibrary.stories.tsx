import { MockedProvider } from '@apollo/client/testing'
import { expect } from '@storybook/jest'
import { Meta, StoryObj } from '@storybook/react'
import { userEvent, waitFor, within } from '@storybook/testing-library'
import { ReactElement, useState } from 'react'

import { FlagsProvider } from '@core/shared/ui/FlagsProvider'

import { journeysAdminConfig } from '../../../libs/storybook'

import { videos } from './VideoFromLocal/data'
import { GET_VIDEOS } from './VideoFromLocal/VideoFromLocal'

import { VideoLibrary } from '.'

const VideoLibraryStory: Meta<typeof VideoLibrary> = {
  ...journeysAdminConfig,
  component: VideoLibrary,
  title: 'Journeys-Admin/Editor/VideoLibrary',
  argTypes: { onSelect: { action: 'clicked' } }
}

const VideoLibraryDefault = ({ onSelect }): ReactElement => {
  const [open, setOpen] = useState(true)

  return (
    <MockedProvider
      mocks={[
        {
          request: {
            query: GET_VIDEOS,
            variables: {
              offset: 0,
              limit: 5,
              where: {
                availableVariantLanguageIds: ['529'],
                title: null
              }
            }
          },
          result: {
            data: {
              videos
            }
          }
        },
        {
          request: {
            query: GET_VIDEOS,
            variables: {
              offset: 3,
              limit: 5,
              where: {
                availableVariantLanguageIds: ['529'],
                title: null
              }
            }
          },
          result: {
            data: {
              videos: []
            }
          }
        },
        {
          request: {
            query: GET_VIDEOS,
            variables: {
              offset: 0,
              limit: 5,
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
                    id: 'variantA',
                    duration: 186
                  }
                }
              ]
            }
          }
        },
        {
          request: {
            query: GET_VIDEOS,
            variables: {
              offset: 1,
              limit: 5,
              where: {
                availableVariantLanguageIds: ['529'],
                title: 'Andreas'
              }
            }
          },
          result: {
            data: {
              videos: []
            }
          }
        }
      ]}
    >
      <FlagsProvider flags={{ videoFromCloudflare: true }}>
        <VideoLibrary
          open={open}
          onClose={() => setOpen(false)}
          onSelect={onSelect}
        />
      </FlagsProvider>
    </MockedProvider>
  )
}

const Template: StoryObj<typeof VideoLibrary> = {
  render: ({ onSelect }) => <VideoLibraryDefault onSelect={onSelect} />
}

export const Default = { ...Template }

export const WithSearch = {
  ...Template,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.parentElement as unknown as HTMLElement)
    await waitFor(
      async () =>
        await expect(
          canvas.getByRole('textbox', { name: 'Search' })
        ).toBeInTheDocument()
    )
    await userEvent.type(
      canvas.getByRole('textbox', { name: 'Search' }),
      'Andreas'
    )
  }
}

const VideoLibraryEmpty = ({ onSelect }): ReactElement => {
  const [open, setOpen] = useState(true)

  return (
    <MockedProvider
      mocks={[
        {
          request: {
            query: GET_VIDEOS,
            variables: {
              offset: 0,
              limit: 5,
              where: {
                availableVariantLanguageIds: ['529'],
                title: '#FallingPlates'
              }
            }
          },
          result: {
            data: {
              videos: []
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

export const Empty: StoryObj<typeof VideoLibrary> = {
  render: ({ onSelect }) => <VideoLibraryEmpty onSelect={onSelect} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.parentElement as unknown as HTMLElement)
    await waitFor(
      async () =>
        await expect(
          canvas.getByRole('textbox', { name: 'Search' })
        ).toBeInTheDocument()
    )
    await userEvent.type(
      canvas.getByRole('textbox', { name: 'Search' }),
      '#FallingPlates'
    )
  }
}

export default VideoLibraryStory
