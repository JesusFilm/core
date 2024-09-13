import type { Meta, StoryObj } from '@storybook/react'
import { NextIntlClientProvider } from 'next-intl'
import { ComponentProps } from 'react'

import { videosAdminConfig } from '../../libs/storybookConfig'

import { NavbarBreadcrumbs } from './NavbarBreadcrumbs'

const meta: Meta<typeof NavbarBreadcrumbs> = {
  ...videosAdminConfig,
  title: 'Videos-Admin/NavbarBreadcrumbs',
  component: NavbarBreadcrumbs,
  parameters: {
    ...videosAdminConfig.parameters,
    nextjs: {
      appDirectory: true
    },
    viewport: {
      defaultViewport: 'none'
    },
    tags: ['!autodocs']
  }
}

export default meta
type Story = StoryObj<
  ComponentProps<typeof NavbarBreadcrumbs> & { locale: string }
>

export const Default: Story = {
  render: ({ locale }) => (
    <NextIntlClientProvider locale={locale}>
      <NavbarBreadcrumbs />
    </NextIntlClientProvider>
  ),
  args: {
    locale: 'en'
  },
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/en',
        segments: [['locale', 'en']]
      }
    }
  }
}

export const WithSettings: Story = {
  render: ({ locale }) => (
    <NextIntlClientProvider locale={locale}>
      <NavbarBreadcrumbs />
    </NextIntlClientProvider>
  ),
  args: {
    locale: 'en'
  },
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/en/settings',
        segments: [['locale', 'en']]
      }
    }
  }
}

export const WithVideos: Story = {
  render: ({ locale }) => (
    <NextIntlClientProvider locale={locale}>
      <NavbarBreadcrumbs />
    </NextIntlClientProvider>
  ),
  args: {
    locale: 'en'
  },
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/en/videos',
        segments: [['locale', 'en']]
      }
    }
  }
}

export const WithVideosAndId: Story = {
  render: ({ locale }) => (
    <NextIntlClientProvider locale={locale}>
      <NavbarBreadcrumbs />
    </NextIntlClientProvider>
  ),
  args: {
    locale: 'en'
  },
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/en/videos/1_jf-0-0',
        segments: [
          ['locale', 'en'],
          ['videoId', '1_jf-0-0']
        ]
      }
    }
  }
}
