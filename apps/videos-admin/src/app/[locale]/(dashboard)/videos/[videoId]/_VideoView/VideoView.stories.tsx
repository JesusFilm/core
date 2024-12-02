import type { Meta, StoryObj } from '@storybook/react'
import { NextIntlClientProvider } from 'next-intl'
import { ComponentProps } from 'react'

import { videosAdminConfig } from '../../../../../../libs/storybookConfig'
import { useAdminVideoMock } from '../../../../../../libs/useAdminVideo/useAdminVideo.mock'
import { EditProvider, EditState } from '../_EditProvider'

import { VideoView } from './VideoView'

const meta: Meta<typeof VideoView> = {
  ...videosAdminConfig,
  component: VideoView,
  title: 'Videos-Admin/VideoView',
  parameters: {
    ...videosAdminConfig.parameters,
    tags: ['!autodocs']
  }
}

type Story = StoryObj<
  ComponentProps<typeof VideoView> & { state: Partial<EditState> }
>

const Template: Story = {
  render: ({ state }) => (
    <NextIntlClientProvider locale="en">
      <EditProvider initialState={state}>
        <VideoView />
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

export const Editable = {
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

export default meta
