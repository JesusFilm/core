import type { Meta, StoryObj } from '@storybook/react'
import { userEvent, within } from '@storybook/test'
import { NextIntlClientProvider } from 'next-intl'
import { ComponentProps } from 'react'

import { videosAdminConfig } from '../../libs/storybookConfig'

import { OptionsMenu } from './OptionsMenu'

const meta: Meta<typeof OptionsMenu> = {
  ...videosAdminConfig,
  title: 'Videos-Admin/OptionsMenu',
  component: OptionsMenu,
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
type Story = StoryObj<ComponentProps<typeof OptionsMenu> & { locale: string }>

export const Default: Story = {
  render: ({ locale }) => (
    <NextIntlClientProvider locale={locale}>
      <OptionsMenu />
    </NextIntlClientProvider>
  ),
  args: {
    locale: 'en'
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const menuButton = canvas.getByTestId('MenuButton')
    await userEvent.click(menuButton)
  }
}
