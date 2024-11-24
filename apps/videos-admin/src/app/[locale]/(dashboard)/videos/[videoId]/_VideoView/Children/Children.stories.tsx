import type { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { videosAdminConfig } from '../../../../../../../libs/storybookConfig'
import { GetAdminVideo_AdminVideo_Children as VideoChildren } from '../../../../../../../libs/useAdminVideo'
import { useAdminVideoMock } from '../../../../../../../libs/useAdminVideo/useAdminVideo.mock'
import { EditProvider } from '../../_EditProvider'

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

type Story = StoryObj<ComponentProps<typeof Children> & { isEdit: boolean }>

const Template: Story = {
  render: ({ isEdit, ...args }) => (
    <EditProvider initialState={{ isEdit: isEdit }}>
      <Children {...args} />
    </EditProvider>
  )
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

export const Editing: Story = {
  ...Template,
  args: {
    childVideos: childVideos,
    isEdit: true
  }
}

export default meta
