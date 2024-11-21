import type { Meta, StoryObj } from '@storybook/react'
import { screen, userEvent } from '@storybook/test'
import { NextIntlClientProvider } from 'next-intl'
import { ComponentProps } from 'react'

import { videosAdminConfig } from '../../../../../../../../libs/storybookConfig'
import { EditProvider, EditState } from '../../../_EditProvider'

import { VideoImageAlt } from './VideoImageAlt'
import { mockVideoImageAlt } from './VideoImageAlt.data'

const meta: Meta<typeof VideoImageAlt> = {
  ...videosAdminConfig,
  component: VideoImageAlt,
  title: 'Videos-Admin/VideoImageAlt',
  parameters: {
    ...videosAdminConfig.parameters,
    tags: ['!autodocs']
  }
}

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
      isEdit: true
    },
    videoImageAlts: mockVideoImageAlt
  }
}

export const Disabled = {
  ...Template,
  args: {
    state: {
      isEdit: false
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
