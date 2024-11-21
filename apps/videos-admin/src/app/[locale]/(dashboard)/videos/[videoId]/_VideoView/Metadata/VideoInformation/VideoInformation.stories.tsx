import type { Meta, StoryObj } from '@storybook/react'
import { screen, userEvent } from '@storybook/test'
import { NextIntlClientProvider } from 'next-intl'
import { ComponentProps } from 'react'

import { videosAdminConfig } from '../../../../../../../../libs/storybookConfig'
import { EditProvider, EditState } from '../../../_EditProvider'
import { mockVideo } from '../../data.mock'

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

type Story = StoryObj<
  ComponentProps<typeof VideoInformation> & { state: Partial<EditState> }
>

const Template: Story = {
  render: ({ state, video }) => (
    <NextIntlClientProvider locale="en">
      <EditProvider initialState={state}>
        <VideoInformation video={video} />
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
    video: mockVideo
  }
}

export const Edit = {
  ...Template,
  args: {
    state: {
      isEdit: true
    },
    video: mockVideo
  }
}

export const Required = {
  ...Template,
  args: {
    state: {
      isEdit: true
    },
    video: mockVideo
  },
  play: async () => {
    await userEvent.type(screen.getByRole('textbox', { name: 'Title' }), 'a')
    await userEvent.clear(screen.getByRole('textbox', { name: 'Title' }))
  }
}

export default meta
