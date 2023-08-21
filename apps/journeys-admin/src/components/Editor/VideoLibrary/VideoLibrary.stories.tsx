import { MockedProvider } from '@apollo/client/testing'
import { expect } from '@storybook/jest'
import { Meta, Story } from '@storybook/react'
import { userEvent, waitFor, within } from '@storybook/testing-library'
import { useState } from 'react'

import { FlagsProvider } from '@core/shared/ui/FlagsProvider'

import { journeysAdminConfig } from '../../../libs/storybook'

import { videos } from './VideoFromLocal/data'
import { GET_VIDEOS } from './VideoFromLocal/VideoFromLocal'

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

export const Default = Template.bind({})

export const WithSearch = Template.bind({})
WithSearch.play = async ({ canvasElement }) => {
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

export const Empty: Story = ({ onSelect }) => {
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
Empty.play = async ({ canvasElement }) => {
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

export default VideoLibraryStory as Meta
