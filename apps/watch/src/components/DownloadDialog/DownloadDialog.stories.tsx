import { Meta, StoryObj } from '@storybook/nextjs'
import noop from 'lodash/noop'
import { ComponentProps } from 'react'
import { screen, userEvent } from 'storybook/test'

import { VideoContentFields } from '../../../__generated__/VideoContentFields'
import { watchConfig } from '../../libs/storybook'
import { VideoProvider } from '../../libs/videoContext'
import { videos } from '../Videos/__generated__/testData'

import { DownloadDialog } from './DownloadDialog'

const DownloadDialogStory: Meta<typeof DownloadDialog> = {
  ...watchConfig,
  component: DownloadDialog,
  title: 'Watch/DownloadDialog',
  parameters: {
    theme: 'light'
  }
}

const routes = ['the-story-of-jesus-for-children']

type Story = StoryObj<
  ComponentProps<typeof DownloadDialog> & { video: VideoContentFields }
>

const Template: Story = {
  render: ({ ...args }) => {
    return (
      <VideoProvider value={{ content: args.video }}>
        <DownloadDialog {...args} />
      </VideoProvider>
    )
  }
}

export const Default = {
  ...Template,
  args: {
    open: true,
    onClose: noop,
    video: videos[0],
    routes
  }
}

export const AcceptedTerms = {
  ...Template,
  args: {
    ...Default.args
  },
  play: async () => {
    await userEvent.click(screen.getByRole('checkbox'))
  }
}

export default DownloadDialogStory
