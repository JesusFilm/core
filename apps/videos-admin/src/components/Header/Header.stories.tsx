import type { Meta, StoryObj } from '@storybook/react'
import { NextIntlClientProvider } from 'next-intl'
import { ComponentProps } from 'react'

import { videosAdminConfig } from '../../libs/storybookConfig'

import { Header } from './Header'

const meta: Meta<typeof Header> = {
  ...videosAdminConfig,
  title: 'Videos-Admin/Header',
  component: Header,
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
type Story = StoryObj<ComponentProps<typeof Header> & { locale: string }>

export const Default: Story = {
  render: ({ locale }) => (
    <NextIntlClientProvider locale={locale}>
      <Header />
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
      <Header />
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
      <Header />
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
      <Header />
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
