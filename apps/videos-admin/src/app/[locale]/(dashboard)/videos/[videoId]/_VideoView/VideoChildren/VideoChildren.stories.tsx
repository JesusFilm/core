import type { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { videosAdminConfig } from '../../../../../../../libs/storybookConfig'
import { GetAdminVideo_AdminVideo_Children as AdminVideoChildren } from '../../../../../../../libs/useAdminVideo'
import { useAdminVideoMock } from '../../../../../../../libs/useAdminVideo/useAdminVideo.mock'

import { VideoChildren } from './VideoChildren'

const childVideos: AdminVideoChildren =
  useAdminVideoMock['result']?.['data']?.['adminVideo']?.['children']

const meta: Meta = {
  ...videosAdminConfig,
  title: 'Videos-Admin/Video/Edit/Children',
  component: VideoChildren,
  parameters: {
    nextjs: {
      appDirectory: true
    },
    viewport: {
      defaultViewport: 'none'
    }
  }
}

type Story = StoryObj<ComponentProps<typeof VideoChildren>>

const Template: Story = {
  render: ({ ...args }) => <VideoChildren {...args} />
}

export const Default: Story = {
  ...Template,
  args: {
    childVideos: childVideos
  }
}

export const Empty: Story = {
  ...Template,
  args: {
    childVideos: []
  }
}

export default meta
