import type { Meta, StoryObj } from '@storybook/react'
import { NextIntlClientProvider } from 'next-intl'
import { ComponentProps } from 'react'

import { videosAdminConfig } from '../../libs/storybookConfig'

import { SideMenu } from './SideMenu'
import { AuthProvider } from '../../libs/auth/AuthProvider'

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
type Story = StoryObj<ComponentProps<typeof SideMenu> & { locale: string }>

export const Default: Story = {
  render: ({ locale }) => (
    <AuthProvider
      user={{
        id: '1',
        displayName: 'Nameingham',
        email: 'nameingham@example.com',
        photoURL: 'url-of-nameinghams-photo'
      }}
    >
      <NextIntlClientProvider locale={locale}>
        <SideMenu />
      </NextIntlClientProvider>
    </AuthProvider>
  ),
  args: {
    locale: 'en'
  }
}
