import { expect } from '@storybook/jest'
import { Meta, StoryObj } from '@storybook/react'
import { screen, userEvent, waitFor } from '@storybook/testing-library'
import noop from 'lodash/noop'
import { ComponentProps } from 'react'

import { videos } from '@core/watch/ui/testDataGenerator/__generated__/testData'

import { VideoContentFields } from '../../../__generated__/VideoContentFields'
import { watchConfig } from '../../libs/storybook'
import { VideoProvider } from '../../libs/videoContext'

import { ShareDialog } from './ShareDialog'

const ShareDialogStory: Meta<typeof ShareDialog> = {
  ...watchConfig,
  component: ShareDialog,
  title: 'Watch/ShareDialog',
  parameters: {
    theme: 'light'
  }
}

const video: VideoContentFields = {
  ...videos[0],
  variant: {
    id: 'videoVariantId',
    __typename: 'VideoVariant',
    duration: videos[0].variant?.duration ?? 0,
    hls: 'https://arc.gt/4jz75',
    downloads: [],
    language: {
      __typename: 'Language',
      id: '529',
      name: [
        {
          __typename: 'Translation',
          value: 'English',
          primary: true
        }
      ]
    },
    slug: `${videos[0].slug}/english`,
    subtitleCount: 1
  },
  description: videos[0].snippet,
  studyQuestions: [],
  childrenCount: 0
}

const routes = ['the-story-of-jesus-for-children']

type Story = StoryObj<
  ComponentProps<typeof ShareDialog> & { video: VideoContentFields }
>

const Template: Story = {
  render: ({ ...args }) => {
    return (
      <VideoProvider value={{ content: args.video }}>
        <ShareDialog {...args} />
      </VideoProvider>
    )
  }
}

export const Basic = {
  ...Template,
  args: {
    open: true,
    onClose: noop,
    video: {
      ...video,
      childrenCount: 1
    },
    routes
  }
}

export const ShareLink = {
  ...Template,
  args: {
    ...Basic.args,
    video
  },
  play: async () => {
    await userEvent.click(screen.getByRole('button', { name: 'Copy Link' }))
  }
}

export const EmbedCode = {
  ...Template,
  args: {
    ...ShareLink.args
  },
  play: async () => {
    await userEvent.click(screen.getByRole('tab', { name: 'Embed Code' }))
    await waitFor(
      async () =>
        await expect(
          screen.getByRole('button', { name: 'Copy Code' })
        ).toBeInTheDocument()
    )
    await userEvent.click(screen.getByRole('button', { name: 'Copy Code' }))
  }
}

export default ShareDialogStory
