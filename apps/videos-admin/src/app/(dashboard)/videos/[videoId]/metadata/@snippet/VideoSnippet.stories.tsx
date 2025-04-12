import type { Meta, StoryObj } from '@storybook/react'
import { screen, userEvent } from '@storybook/test'
import { ComponentProps } from 'react'

import { videosAdminConfig } from '../../../../../../../libs/storybookConfig'
import { GetAdminVideo_AdminVideo_VideoSnippets as VideoSnippets } from '../../../../../../../libs/useAdminVideo/useAdminVideo'
import { useAdminVideoMock } from '../../../../../../../libs/useAdminVideo/useAdminVideo.mock'

import { VideoSnippet } from './page'

const meta: Meta<typeof VideoSnippet> = {
  ...videosAdminConfig,
  component: VideoSnippet,
  title: 'Videos-Admin/VideoSnippet',
  parameters: {
    ...videosAdminConfig.parameters,
    tags: ['!autodocs'],
    nextjs: {
      appDirectory: true
    },
    viewport: {
      defaultViewport: 'none'
    }
  }
}

const mockVideoSnippets: VideoSnippets =
  useAdminVideoMock['result']?.['data']?.['adminVideo']?.['snippet']

type Story = StoryObj<ComponentProps<typeof VideoSnippet>>

const Template: Story = {
  render: ({ videoSnippets }) => <VideoSnippet videoSnippets={videoSnippets} />
}

export const Default = {
  ...Template,
  args: {
    videoSnippets: mockVideoSnippets
  }
}

export const Required = {
  ...Template,
  args: {
    videoSnippets: mockVideoSnippets
  },
  play: async () => {
    await userEvent.type(screen.getByRole('textbox'), 'a')
    await userEvent.clear(screen.getByRole('textbox'))
  }
}

export default meta
