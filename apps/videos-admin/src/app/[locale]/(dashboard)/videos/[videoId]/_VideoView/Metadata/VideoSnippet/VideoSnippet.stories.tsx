import type { Meta, StoryObj } from '@storybook/react'
import { screen, userEvent } from '@storybook/test'
import { NextIntlClientProvider } from 'next-intl'
import { ComponentProps } from 'react'

import { videosAdminConfig } from '../../../../../../../../libs/storybookConfig'
import { EditProvider, EditState } from '../../../_EditProvider'

import { VideoSnippet } from './VideoSnippet'
import { mockVideoSnippets } from './VideoSnippet.data'

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

type Story = StoryObj<
  ComponentProps<typeof VideoSnippet> & {
    state: Partial<EditState>
  }
>

const Template: Story = {
  render: ({ state, videoSnippets }) => (
    <NextIntlClientProvider locale="en">
      <EditProvider initialState={state}>
        <VideoSnippet videoSnippets={videoSnippets} />
      </EditProvider>
    </NextIntlClientProvider>
  )
}

export const Default = {
  ...Template,
  args: {
    state: { isEdit: true },
    videoSnippets: mockVideoSnippets
  }
}

export const Disabled = {
  ...Template,
  args: {
    state: {
      isEdit: false
    },
    videoSnippets: mockVideoSnippets
  }
}

export const Required = {
  ...Template,
  args: {
    state: {
      isEdit: true
    },
    videoSnippets: mockVideoSnippets
  },
  play: async () => {
    await userEvent.type(screen.getByRole('textbox'), 'a')
    await userEvent.clear(screen.getByRole('textbox'))
  }
}

export default meta
