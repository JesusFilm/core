import { Meta, StoryObj } from '@storybook/react'
import { ChapterCard } from './ChapterCard'
import { ComponentPropsWithoutRef } from 'react'
import { VideoChildFields } from '../../../../../__generated__/VideoChildFields'
import { VideoLabel } from '../../../../../__generated__/globalTypes'

const video: VideoChildFields = {
  __typename: 'Video',
  id: 'video1.id',
  label: VideoLabel.shortFilm,
  title: [{ __typename: 'VideoTitle', value: 'FallingPlates' }],
  images: [
    {
      __typename: 'CloudflareImage',
      mobileCinematicHigh:
        'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/2_0-FallingPlates.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95'
    }
  ],
  imageAlt: [{ __typename: 'VideoImageAlt', value: 'FallingPlates' }],
  snippet: [{ __typename: 'VideoSnippet', value: 'FallingPlates' }],
  description: [
    { __typename: 'VideoDescription', value: 'This is a text description' }
  ],
  slug: 'falling-plates',
  variant: {
    __typename: 'VideoVariant',
    id: 'video1.id',
    hls: 'https://arc.gt/hls/2_0-FallingPlates/529',
    duration: 100,
    slug: 'falling-plates'
  },
  studyQuestions: [],
  childrenCount: 0
}

type StoryArgs = ComponentPropsWithoutRef<typeof ChapterCard>

const meta = {
  title: 'ChapterCard',
  component: ChapterCard
} satisfies Meta<StoryArgs>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    video
  }
}
