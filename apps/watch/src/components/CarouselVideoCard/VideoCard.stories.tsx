import { Meta, StoryObj } from '@storybook/nextjs'
import { ComponentPropsWithoutRef } from 'react'

import { VideoLabel } from '../../../__generated__/globalTypes'

import { VideoCard } from './VideoCard'

type StoryArgs = ComponentPropsWithoutRef<typeof VideoCard>

const meta = {
  title: 'VideoCard',
  component: VideoCard
} satisfies Meta<StoryArgs>

export default meta
type Story = StoryObj<typeof meta>

// Mock data that matches UnifiedCardData interface
const mockVideoData = {
  id: '1_jf-0-0',
  title: 'Test Video Title',
  images: [{ mobileCinematicHigh: 'https://example.com/image.jpg' }],
  imageAlt: [{ value: 'Test video' }],
  label: VideoLabel.featureFilm,
  slug: 'test-video'
}

export const Default: Story = {
  args: {
    data: mockVideoData,
    active: false
  }
}

export const Active: Story = {
  args: {
    data: mockVideoData,
    active: true
  }
}
