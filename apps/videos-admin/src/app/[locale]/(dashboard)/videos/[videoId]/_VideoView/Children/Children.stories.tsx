import type { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { videosAdminConfig } from '../../../../../../../libs/storybookConfig'
import { GetAdminVideo_AdminVideo_Children as VideoChildren } from '../../../../../../../libs/useAdminVideo'
import { useAdminVideoMock } from '../../../../../../../libs/useAdminVideo/useAdminVideo.mock'

import { Children } from './Children'

const childVideos: VideoChildren =
  useAdminVideoMock['result']?.['data']?.['adminVideo']?.['children']

const meta: Meta = {
  ...videosAdminConfig,
  title: 'Videos-Admin/Video/Edit/Children',
  component: Children,
  parameters: {
    nextjs: {
      appDirectory: true
    },
    viewport: {
      defaultViewport: 'none'
    }
  }
}

type Story = StoryObj<ComponentProps<typeof Children>>

const Template: Story = {
  render: ({ ...args }) => <Children {...args} />
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
