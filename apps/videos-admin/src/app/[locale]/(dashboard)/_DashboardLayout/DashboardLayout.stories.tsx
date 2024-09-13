import type { Meta, StoryObj } from '@storybook/react'
import { NextIntlClientProvider } from 'next-intl'
import { ComponentProps } from 'react'

import { AuthProvider } from '../../../../libs/auth/AuthProvider'
import { videosAdminConfig } from '../../../../libs/storybookConfig'

import { DashboardLayout } from './DashboardLayout'

const meta: Meta<typeof DashboardLayout> = {
  ...videosAdminConfig,
  title: 'Videos-Admin/DashboardLayout',
  component: DashboardLayout,
  parameters: {
    ...videosAdminConfig.parameters,
    nextjs: {
      appDirectory: true
    },
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'none'
    }
  }
}

export default meta
type Story = StoryObj<
  ComponentProps<typeof DashboardLayout> & { locale: string }
>

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
        <DashboardLayout>
          <div>Hello World</div>
        </DashboardLayout>
      </NextIntlClientProvider>
    </AuthProvider>
  ),
  args: {
    locale: 'en'
  }
}
