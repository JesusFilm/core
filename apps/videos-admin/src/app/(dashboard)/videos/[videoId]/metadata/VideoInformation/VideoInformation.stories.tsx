import type { Meta, StoryObj } from '@storybook/react'
import { screen, userEvent } from '@storybook/test'
import { ComponentProps } from 'react'

import { videosAdminConfig } from '../../../../../../../libs/storybookConfig'
import { GetAdminVideo_AdminVideo as AdminVideo } from '../../../../../../../libs/useAdminVideo/useAdminVideo'
import { useAdminVideoMock } from '../../../../../../../libs/useAdminVideo/useAdminVideo.mock'

import { VideoInformation } from './VideoInfomation'

const meta: Meta<typeof VideoInformation> = {
  ...videosAdminConfig,
  component: VideoInformation,
  title: 'Videos-Admin/VideoInformation',
  parameters: {
    ...videosAdminConfig.parameters,
    tags: ['!autodocs']
  }
}

const mockVideo: AdminVideo =
  useAdminVideoMock['result']?.['data']?.['adminVideo']

type Story = StoryObj<ComponentProps<typeof VideoInformation>>

const Template: Story = {
  render: ({ video }) => <VideoInformation video={video} />
}

export const Default = {
  ...Template,
  args: {
    video: mockVideo
  }
}

export const Required = {
  ...Template,
  args: {
    video: mockVideo
  },
  play: async () => {
    await userEvent.type(screen.getByRole('textbox', { name: 'Title' }), 'a')
    await userEvent.clear(screen.getByRole('textbox', { name: 'Title' }))
  }
}

export default meta
