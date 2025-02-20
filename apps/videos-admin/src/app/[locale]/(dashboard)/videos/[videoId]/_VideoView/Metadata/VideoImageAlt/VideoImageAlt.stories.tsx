import type { Meta, StoryObj } from '@storybook/react'
import { screen, userEvent } from '@storybook/test'
import { NextIntlClientProvider } from 'next-intl'
import { ComponentProps } from 'react'

import { videosAdminConfig } from '../../../../../../../../libs/storybookConfig'
import {
  GetAdminVideo_AdminVideo as Video,
  GetAdminVideo_AdminVideo_VideoImageAlts as VideoImageAlts
} from '../../../../../../../../libs/useAdminVideo/useAdminVideo'
import { useAdminVideoMock } from '../../../../../../../../libs/useAdminVideo/useAdminVideo.mock'
import { VideoProvider } from '../../../../../../../../libs/VideoProvider'

import { VideoImageAlt } from './VideoImageAlt'

const meta: Meta<typeof VideoImageAlt> = {
  ...videosAdminConfig,
  component: VideoImageAlt,
  title: 'Videos-Admin/VideoImageAlt',
  parameters: {
    ...videosAdminConfig.parameters,
    tags: ['!autodocs']
  }
}

const mockVideoImageAlt: VideoImageAlts =
  useAdminVideoMock['result']?.['data']?.['adminVideo']?.['imageAlt']

type Story = StoryObj<ComponentProps<typeof VideoImageAlt>>

const Template: Story = {
  render: ({ videoImageAlts }) => (
    <NextIntlClientProvider locale="en">
      <VideoProvider video={{ id: '1' } as Video}>
        <VideoImageAlt videoImageAlts={videoImageAlts} />
      </VideoProvider>
    </NextIntlClientProvider>
  )
}

export const Default = {
  ...Template,
  args: {
    videoImageAlts: mockVideoImageAlt
  }
}

export const Required = {
  ...Template,
  args: {
    videoImageAlts: mockVideoImageAlt
  },
  play: async () => {
    await userEvent.type(
      screen.getByRole('textbox', { name: 'Image Alt' }),
      'a'
    )
    await userEvent.clear(screen.getByRole('textbox', { name: 'Image Alt' }))
  }
}

export default meta
