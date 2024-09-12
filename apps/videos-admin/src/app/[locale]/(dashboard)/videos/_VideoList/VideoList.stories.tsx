import { MockedResponse } from '@apollo/client/testing'
import type { Meta, StoryObj } from '@storybook/react'
import { NextIntlClientProvider } from 'next-intl'
import { ComponentProps } from 'react'

import { videosAdminConfig } from '../../../../../libs/storybookConfig'

import {
  GET_VIDEOS_AND_COUNT,
  GetVideosAndCount,
  GetVideosAndCountVariables,
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

const mockGetVideosAndCount: MockedResponse<
  GetVideosAndCount,
  GetVideosAndCountVariables
> = {
  request: {
    query: GET_VIDEOS_AND_COUNT,
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
      videosCount: 3,
      videos: [
        {
          id: 'example-id',
          snippet: [{ value: 'Example snippet', primary: true }],
          title: [{ value: 'Example title', primary: true }]
        },
        {
          id: 'example-id',
          snippet: [{ value: 'Example snippet', primary: true }],
          title: [{ value: 'Example title', primary: true }]
        },
        {
          id: 'example-id',
          snippet: [{ value: 'Example snippet', primary: true }],
          title: [{ value: 'Example title', primary: true }]
        }
      ]
    }
  }
}

const mockGetVideosAndCount100: MockedResponse<
  GetVideosAndCount,
  GetVideosAndCountVariables
> = {
  request: {
    query: GET_VIDEOS_AND_COUNT,
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
      videosCount: 100,
      videos: [
        ...Array.from(new Array(50), (_val, i) => ({
          id: `example-id-${i}`,
          snippet: [{ value: `Example Snippet ${i}`, primary: true }],
          title: [{ value: `Example title ${i}`, primary: true }]
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
      mocks: [mockGetVideosAndCount]
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
      mocks: [mockGetVideosAndCount100]
    }
  }
}
