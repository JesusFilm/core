import type { Meta, StoryObj } from '@storybook/react'
import { screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import { ComponentProps } from 'react'

import { VideoInformation } from './VideoInfomation'
import { videosAdminConfig } from '../../../../../../../../libs/storybookConfig'
import { useAdminVideoMock } from '../../../../../../../../libs/useAdminVideo/useAdminVideo.mock'
import userEvent from '@testing-library/user-event'
import { EditProvider } from '../../../_EditProvider'

const meta: Meta<typeof VideoInformation> = {
  ...videosAdminConfig,
  component: VideoInformation,
  title: 'Videos-Admin/VideoInformation',
  parameters: {
    ...videosAdminConfig.parameters,
    tags: ['!autodocs']
  }
}

type Story = StoryObj<ComponentProps<typeof VideoInformation>>

const Template: Story = {
  render: ({ ...args }) => (
    <NextIntlClientProvider locale="en">
      <EditProvider initialState={args.state}>
        <VideoInformation />
      </EditProvider>
    </NextIntlClientProvider>
  )
}

export const Default = {
  ...Template,
  args: {
    state: {
      isEdit: false
    }
  },
  parameters: {
    apolloClient: {
      mocks: [useAdminVideoMock]
    },
    nextjs: {
      appDirectory: true,
      navigation: {
        segments: [
          ['videoId', 'someId'],
          ['locale', 'en']
        ]
      }
    }
  }
}

export const Edit = {
  ...Template,
  args: {
    state: {
      isEdit: true
    }
  },
  parameters: {
    apolloClient: {
      mocks: [useAdminVideoMock]
    },
    nextjs: {
      appDirectory: true,
      navigation: {
        segments: [
          ['videoId', 'someId'],
          ['locale', 'en']
        ]
      }
    }
  }
}

export const Required = {
  ...Template,
  args: {
    state: {
      isEdit: true
    }
  },
  parameters: {
    apolloClient: {
      mocks: [useAdminVideoMock]
    },
    nextjs: {
      appDirectory: true,
      navigation: {
        segments: [
          ['videoId', 'someId'],
          ['locale', 'en']
        ]
      }
    }
  },
  play: async () => {
    await userEvent.type(screen.getByRole('textbox', { name: 'Title' }), 'a')
    await userEvent.clear(screen.getByRole('textbox', { name: 'Title' }))
  }
}

export default meta
