import { MockedResponse } from '@apollo/client/testing'
import type { Meta, StoryObj } from '@storybook/react'
import { NextIntlClientProvider } from 'next-intl'
import { ComponentProps } from 'react'

import { videosAdminConfig } from '../../../../../libs/storybookConfig'

import {
  GET_ADMIN_VIDEOS_AND_COUNT,
  GetAdminVideosAndCount,
  GetAdminVideosAndCountVariables,
  VideoList
} from './VideoList'

const meta: Meta<typeof VideoList> = {
  ...videosAdminConfig,
  title: 'Videos-Admin/VideoList',
  component: VideoList,
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
type Story = StoryObj<ComponentProps<typeof VideoList> & { locale: string }>

const mockGetAdminVideosAndCount: MockedResponse<
  GetAdminVideosAndCount,
  GetAdminVideosAndCountVariables
> = {
  request: {
    query: GET_ADMIN_VIDEOS_AND_COUNT,
    variables: {
      limit: 50,
      offset: 0,
      showTitle: true,
      showSnippet: true,
      where: {}
    }
  },
  result: {
    data: {
      adminVideosCount: 3,
      adminVideos: [
        {
          id: 'video1.id',
          snippet: [{ value: 'Example snippet', primary: true }],
          title: [{ value: 'Video 1 title', primary: true }],
          published: true
        },
        {
          id: 'video2.id',
          snippet: [{ value: 'Example snippet', primary: true }],
          title: [{ value: 'Video 2 title', primary: true }],
          published: false
        },
        {
          id: 'video3.id',
          snippet: [{ value: 'Example snippet', primary: true }],
          title: [{ value: 'Video 3 title', primary: true }],
          published: true
        }
      ]
    }
  }
}

const mockGetAdminVideosAndCount100: MockedResponse<
  GetAdminVideosAndCount,
  GetAdminVideosAndCountVariables
> = {
  request: {
    query: GET_ADMIN_VIDEOS_AND_COUNT,
    variables: {
      limit: 50,
      offset: 0,
      showTitle: true,
      showSnippet: true,
      where: {}
    }
  },
  result: {
    data: {
      adminVideosCount: 100,
      adminVideos: [
        ...Array.from(new Array(50), (_val, i) => ({
          id: `example-id-${i}`,
          snippet: [{ value: `Example Snippet ${i}`, primary: true }],
          title: [{ value: `Example title ${i}`, primary: true }],
          published: i % 2 === 0
        }))
      ]
    }
  }
}

export const Default: Story = {
  render: ({ locale }) => (
    <NextIntlClientProvider locale={locale}>
      <VideoList />
    </NextIntlClientProvider>
  ),
  args: {
    locale: 'en'
  }
}

export const WithVideos: Story = {
  render: ({ locale }) => (
    <NextIntlClientProvider locale={locale}>
      <VideoList />
    </NextIntlClientProvider>
  ),
  args: {
    locale: 'en'
  },
  parameters: {
    apolloClient: {
      mocks: [mockGetAdminVideosAndCount]
    }
  }
}

export const WithVideosLong: Story = {
  render: ({ locale }) => (
    <NextIntlClientProvider locale={locale}>
      <VideoList />
    </NextIntlClientProvider>
  ),
  args: {
    locale: 'en'
  },
  parameters: {
    apolloClient: {
      mocks: [mockGetAdminVideosAndCount100]
    }
  }
}
