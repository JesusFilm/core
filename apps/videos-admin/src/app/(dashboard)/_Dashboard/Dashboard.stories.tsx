import type { Meta, StoryObj } from '@storybook/react'
import { NextIntlClientProvider } from 'next-intl'
import { ComponentProps } from 'react'

import { videosAdminConfig } from '../../../libs/storybookConfig'

import { Dashboard } from './Dashboard'

const meta: Meta<typeof Dashboard> = {
  ...videosAdminConfig,
  title: 'Videos-Admin/Dashboard',
  component: Dashboard,
  parameters: {
    ...videosAdminConfig.parameters,
    nextjs: {
      appDirectory: true
    },
    viewport: {
      defaultViewport: 'none'
    }
  }
}

export default meta

type Story = StoryObj<ComponentProps<typeof Dashboard> & { locale: string }>

export const Default: Story = {
  render: ({ locale }) => (
    <NextIntlClientProvider locale={locale}>
      <Dashboard />
    </NextIntlClientProvider>
  ),
  args: {
    locale: 'en'
  }
}
