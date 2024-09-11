import type { Meta, StoryObj } from '@storybook/react'
import { NextIntlClientProvider } from 'next-intl'
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
  }
}

export default meta
type Story = StoryObj<ComponentProps<typeof AppNavbar> & { locale: string }>

export const Default: Story = {
  render: ({ locale }) => (
    <NextIntlClientProvider locale={locale}>
      <AppNavbar />
    </NextIntlClientProvider>
  ),
  args: {
    locale: 'en'
  }
}
