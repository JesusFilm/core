import type { Meta, StoryObj } from '@storybook/react'
import { screen, userEvent } from '@storybook/test'
import { NextIntlClientProvider } from 'next-intl'
import { ComponentProps } from 'react'

import { videosAdminConfig } from '../../../../../../../../libs/storybookConfig'
import { GetAdminVideo_AdminVideo_VideoImageAlts as VideoImageAlts } from '../../../../../../../../libs/useAdminVideo/useAdminVideo'
import { useAdminVideoMock } from '../../../../../../../../libs/useAdminVideo/useAdminVideo.mock'
import { EditProvider, EditState } from '../../../_EditProvider'

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

type Story = StoryObj<
  ComponentProps<typeof VideoImageAlt> & { state: Partial<EditState> }
>

const Template: Story = {
  render: ({ state, videoImageAlts }) => (
    <NextIntlClientProvider locale="en">
      <EditProvider initialState={state}>
        <VideoImageAlt videoImageAlts={videoImageAlts} />
      </EditProvider>
    </NextIntlClientProvider>
  )
}

export const Default = {
  ...Template,
  args: {
    state: {
      isEdit: false
    },
    videoImageAlts: mockVideoImageAlt
  }
}

export const Editable = {
  ...Template,
  args: {
    state: {
      isEdit: true
    },
    videoImageAlts: mockVideoImageAlt
  }
}

export const Required = {
  ...Template,
  args: {
    state: {
      isEdit: true
    },
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
