import type { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { videosAdminConfig } from '../../libs/storybookConfig'

import { CenterPage } from './CenterPage'

const meta: Meta<typeof CenterPage> = {
  ...videosAdminConfig,
  title: 'Videos-Admin/CenterPage',
  component: CenterPage,
  parameters: {
    ...videosAdminConfig.parameters,
    nextjs: {
      appDirectory: false
    },
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'none'
    }
  },
  tags: ['!autodocs']
}

export default meta
type Story = StoryObj<ComponentProps<typeof CenterPage>>

export const Default: Story = {
  render: () => (
    <CenterPage>
      <div>Hello World</div>
    </CenterPage>
  )
}
