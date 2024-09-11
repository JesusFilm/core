import type { Meta, StoryObj } from '@storybook/react'
import { NextIntlClientProvider } from 'next-intl'
import { ComponentProps } from 'react'

import { videosAdminConfig } from '../../libs/storybookConfig'

import { CenterPage } from './CenterPage'

const meta: Meta<typeof CenterPage> = {
  ...videosAdminConfig,
  title: 'Videos-Admin/CenterPage',
  component: CenterPage,
  parameters: {
    ...videosAdminConfig.parameters,
    nextjs: {
      appDirectory: false
    },
    layout: 'fullscreen'
  },
  tags: ['!autodocs']
}

export default meta
type Story = StoryObj<ComponentProps<typeof CenterPage> & { locale: string }>

export const Default: Story = {
  render: ({ locale }) => (
    <NextIntlClientProvider locale={locale}>
      <CenterPage>
        <div>Hello World</div>
      </CenterPage>
    </NextIntlClientProvider>
  ),
  args: {
    locale: 'en'
  }
}
