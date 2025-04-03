import type { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { videosAdminConfig } from '../../../../../libs/storybookConfig'
import { useAdminVideoMock } from '../../../../../libs/useAdminVideo/useAdminVideo.mock'

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

type Story = StoryObj<ComponentProps<typeof VideoView>>

const Template: Story = {
  render: () => (
    
      <VideoView />
    
  )
}

export const Default = {
  ...Template,
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
