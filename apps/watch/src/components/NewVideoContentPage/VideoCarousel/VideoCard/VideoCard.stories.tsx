import { Meta, StoryObj } from '@storybook/react'
import { ComponentPropsWithoutRef } from 'react'

import { videos } from '../../../Videos/__generated__/testData'

import { VideoCard } from './VideoCard'

type StoryArgs = ComponentPropsWithoutRef<typeof VideoCard>

const meta = {
  title: 'VideoCard',
  component: VideoCard
} satisfies Meta<StoryArgs>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    video: videos[0],
    active: false
  }
}

export const Active: Story = {
  args: {
    video: videos[0],
    active: true
  }
}
