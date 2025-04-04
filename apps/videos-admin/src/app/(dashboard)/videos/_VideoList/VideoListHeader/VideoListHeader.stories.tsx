import { Meta, StoryObj } from '@storybook/react'
import { ComponentPropsWithoutRef } from 'react'

import { videosAdminConfig } from '../../../../../libs/storybookConfig'

import { VideoListHeader } from './VideoListHeader'

type StoryArgs = ComponentPropsWithoutRef<typeof VideoListHeader>

const meta = {
  ...videosAdminConfig,
  title: 'Videos-Admin/VideoList/VideoListHeader',
  component: VideoListHeader,
  parameters: {
    tags: ['!autodocs']
  }
} satisfies Meta<StoryArgs>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {}
}
