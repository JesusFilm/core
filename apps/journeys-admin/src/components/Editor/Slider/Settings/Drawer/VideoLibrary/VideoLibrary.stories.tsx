import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/nextjs'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ComponentProps, ReactElement, useState } from 'react'

import { InstantSearchTestWrapper } from '@core/journeys/ui/algolia/InstantSearchTestWrapper'
import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { getAlgoliaVideosHandlers } from './VideoLibrary.handlers'

import { VideoLibrary } from '.'

const VideoLibraryStory: Meta<typeof VideoLibrary> = {
  ...journeysAdminConfig,
  component: VideoLibrary,
  title: 'Journeys-Admin/Editor/Slider/Settings/Drawer/VideoLibrary',
  argTypes: { onSelect: { action: 'clicked' } }
}

const VideoLibraryDefault = ({ onSelect, query }): ReactElement => {
  const [open, setOpen] = useState(true)

  return (
    <InstantSearchTestWrapper query={query}>
      <VideoLibrary
        open={open}
        onClose={() => setOpen(false)}
        onSelect={onSelect}
      />
    </InstantSearchTestWrapper>
  )
}

const Template: StoryObj<
  ComponentProps<typeof VideoLibrary> & { query: string }
> = {
  render: ({ onSelect, query }) => (
    <VideoLibraryDefault onSelect={onSelect} query={query} />
  )
}

export const Default = {
  ...Template,
  parameters: {
    msw: {
      handlers: [getAlgoliaVideosHandlers]
    }
  }
}

export const WithSearch = {
  ...Template,
  parameters: {
    msw: {
      handlers: [getAlgoliaVideosHandlers]
    }
  },
  args: {
    query: 'Jesus'
  },
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
      'Jesus'
    )
  }
}

const VideoLibraryEmpty = ({ onSelect }): ReactElement => {
  const [open, setOpen] = useState(true)

  return (
    <MockedProvider>
      <InstantSearchTestWrapper>
        <VideoLibrary
          open={open}
          onClose={() => setOpen(false)}
          onSelect={onSelect}
        />
      </InstantSearchTestWrapper>
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
