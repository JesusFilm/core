import type { Meta, StoryObj } from '@storybook/react'
import { screen, userEvent } from '@storybook/test'
import { NextIntlClientProvider } from 'next-intl'
import { ComponentProps } from 'react'

import { videosAdminConfig } from '../../../../../../../../libs/storybookConfig'
import { GetAdminVideo_AdminVideo_VideoDescriptions as VideoDescriptions } from '../../../../../../../../libs/useAdminVideo/useAdminVideo'
import { useAdminVideoMock } from '../../../../../../../../libs/useAdminVideo/useAdminVideo.mock'
import { EditProvider, EditState } from '../../../_EditProvider'

import { VideoDescription } from './VideoDescription'

const meta: Meta<typeof VideoDescription> = {
  ...videosAdminConfig,
  component: VideoDescription,
  title: 'Videos-Admin/VideoDescription',
  parameters: {
    ...videosAdminConfig.parameters,
    tags: ['!autodocs']
  }
}

const mockVideoDescriptions: VideoDescriptions =
  useAdminVideoMock['result']?.['data']?.['adminVideo']?.['description']

type Story = StoryObj<
  ComponentProps<typeof VideoDescription> & { state: Partial<EditState> }
>

const Template: Story = {
  render: ({ state, videoDescriptions }) => (
    <NextIntlClientProvider locale="en">
      <EditProvider initialState={state}>
        <VideoDescription videoDescriptions={videoDescriptions} />
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
    videoDescriptions: mockVideoDescriptions
  }
}

export const Editable = {
  ...Template,
  args: {
    state: {
      isEdit: true
    },
    videoDescriptions: mockVideoDescriptions
  }
}

export const Required = {
  ...Template,
  args: {
    state: {
      isEdit: true
    },
    videoDescriptions: mockVideoDescriptions
  },
  play: async () => {
    await userEvent.type(screen.getByRole('textbox'), 'a')
    await userEvent.clear(screen.getByRole('textbox'))
  }
}

export default meta
