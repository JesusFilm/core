import type { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { videosAdminConfig } from '../../libs/storybookConfig'

import { AppNavbar } from './AppNavbar'

const meta: Meta<typeof AppNavbar> = {
  ...videosAdminConfig,
  title: 'Videos-Admin/AppNavbar',
  component: AppNavbar,
  parameters: {
    nextjs: {
      appDirectory: true
    },
    viewport: {
      defaultViewport: 'mobileMax'
    }
  },
  tags: ['!autodocs']
}

export default meta
type Story = StoryObj<ComponentProps<typeof AppNavbar>>

export const Default: Story = {
  render: () => <AppNavbar />
}
