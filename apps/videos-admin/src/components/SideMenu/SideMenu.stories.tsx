import type { Meta, StoryObj } from '@storybook/react'

import { ComponentProps } from 'react'

import { AuthProvider } from '../../libs/auth/AuthProvider'
import { videosAdminConfig } from '../../libs/storybookConfig'

import { SideMenu } from './SideMenu'

const meta: Meta<typeof SideMenu> = {
  ...videosAdminConfig,
  title: 'Videos-Admin/SideMenu',
  component: SideMenu,
  parameters: {
    nextjs: {
      appDirectory: true
    },
    viewport: {
      defaultViewport: 'none'
    }
  }
}

export default meta
type Story = StoryObj<ComponentProps<typeof SideMenu>>

export const Default: Story = {
  render: () => (
    <AuthProvider
      user={{
        id: '1',
        displayName: 'Nameingham',
        email: 'nameingham@example.com',
        photoURL: 'url-of-nameinghams-photo'
      }}
    >
      
        <SideMenu />
      
    </AuthProvider>
  ),
  
}
