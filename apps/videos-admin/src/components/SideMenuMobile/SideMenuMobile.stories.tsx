import type { Meta, StoryObj } from '@storybook/react'
import noop from 'lodash/noop'
import { NextIntlClientProvider } from 'next-intl'
import { ComponentProps } from 'react'

import { AuthProvider } from '../../libs/auth/AuthProvider'
import { videosAdminConfig } from '../../libs/storybookConfig'

import { SideMenuMobile } from './SideMenuMobile'

const meta: Meta<typeof SideMenuMobile> = {
  ...videosAdminConfig,
  title: 'Videos-Admin/SideMenuMobile',
  component: SideMenuMobile,
  parameters: {
    nextjs: {
      appDirectory: true
    },
    viewport: {
      defaultViewport: 'mobileMax'
    },
    layout: 'fullscreen'
  },
  tags: ['!autodocs']
}

export default meta
type Story = StoryObj<
  ComponentProps<typeof SideMenuMobile> & { locale: string }
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
        <SideMenuMobile open toggleDrawer={(newOpen: boolean) => noop} />
      </NextIntlClientProvider>
    </AuthProvider>
  ),
  args: {
    locale: 'en'
  }
}
