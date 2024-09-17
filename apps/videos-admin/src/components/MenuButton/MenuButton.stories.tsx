import type { Meta, StoryObj } from '@storybook/react'
import { NextIntlClientProvider } from 'next-intl'
import { ComponentProps } from 'react'

import { videosAdminConfig } from '../../libs/storybookConfig'

import { MenuButton } from './MenuButton'

const meta: Meta<typeof MenuButton> = {
  ...videosAdminConfig,
  title: 'Videos-Admin/MenuButton',
  component: MenuButton,
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
type Story = StoryObj<ComponentProps<typeof MenuButton> & { locale: string }>

export const Default: Story = {
  render: ({ locale, showBadge }) => (
    <NextIntlClientProvider locale={locale}>
      <MenuButton showBadge={showBadge} />
    </NextIntlClientProvider>
  ),
  args: {
    locale: 'en',
    showBadge: false
  }
}

export const WithBadge = {
  ...Default,
  args: {
    locale: 'en',
    showBadge: true
  }
}
