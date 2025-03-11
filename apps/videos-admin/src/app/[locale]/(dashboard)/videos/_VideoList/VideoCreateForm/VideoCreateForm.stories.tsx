import { Meta, StoryObj } from '@storybook/react'
import { ComponentPropsWithoutRef } from 'react'

import { videosAdminConfig } from '../../../../../../libs/storybookConfig'

import { VideoCreateForm } from './VideoCreateForm'

type StoryArgs = ComponentPropsWithoutRef<typeof VideoCreateForm>

const meta = {
  ...videosAdminConfig,
  title: 'Videos-Admin/VideoList/VideoCreateForm',
  component: VideoCreateForm,
  parameters: {
    tags: ['!autodocs']
  }
} satisfies Meta<StoryArgs>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    close: () => undefined
  }
}
