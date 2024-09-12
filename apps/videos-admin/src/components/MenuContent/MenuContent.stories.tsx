import type { Meta, StoryObj } from '@storybook/react'
import { NextIntlClientProvider } from 'next-intl'
import { ComponentProps } from 'react'

import { videosAdminConfig } from '../../libs/storybookConfig'

import { MenuContent } from './MenuContent'

const meta: Meta<typeof MenuContent> = {
  ...videosAdminConfig,
  title: 'Videos-Admin/MenuContent',
  component: MenuContent,
  parameters: {
    ...videosAdminConfig.parameters,
    nextjs: {
      appDirectory: true
    },

    viewport: {
      defaultViewport: 'none'
    },
    showThemeToggle: true
  }
}

export default meta
type Story = StoryObj<ComponentProps<typeof MenuContent> & { locale: string }>

export const Default: Story = {
  render: ({ locale }) => (
    <NextIntlClientProvider locale={locale}>
      <MenuContent />
    </NextIntlClientProvider>
  ),
  args: {
    locale: 'en'
  }
}
