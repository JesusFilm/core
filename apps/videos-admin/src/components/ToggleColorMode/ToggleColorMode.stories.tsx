import type { Meta, StoryObj } from '@storybook/react'
import { NextIntlClientProvider } from 'next-intl'
import { ComponentProps } from 'react'

import { videosAdminConfig } from '../../libs/storybookConfig'

import { ToggleColorMode } from './ToggleColorMode'

const meta: Meta<typeof ToggleColorMode> = {
  ...videosAdminConfig,
  title: 'Videos-Admin/ToggleColorMode',
  component: ToggleColorMode,
  parameters: {
    nextjs: {
      appDirectory: false
    },
    viewport: {
      defaultViewport: 'none'
    }
  }
}

export default meta
type Story = StoryObj<
  ComponentProps<typeof ToggleColorMode> & { locale: string }
>

export const Default: Story = {
  render: ({ locale }) => (
    <NextIntlClientProvider locale={locale}>
      <ToggleColorMode />
    </NextIntlClientProvider>
  ),
  args: {
    locale: 'en'
  }
}
