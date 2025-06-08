import { Meta, StoryObj } from '@storybook/react'

import { sharedUiConfig } from '@core/shared/ui/sharedUiConfig'

import { VideoLabel } from '../../../__generated__/globalTypes'

import { VideoDescription } from './VideoDescription'

const meta = {
  ...sharedUiConfig,
  title: 'Watch/VideoDescription',
  component: VideoDescription
} satisfies Meta<typeof VideoDescription>

export default meta

type Story = StoryObj<typeof VideoDescription>

export const Default: Story = {
  args: {
    title: 'The Life of Jesus',
    description:
      'Experience the life of Jesus through this powerful film that brings the Gospel to life.',
    label: VideoLabel.featureFilm
  }
}

export const ShortFilm: Story = {
  args: {
    title: 'The Good Samaritan',
    description:
      'A modern retelling of the parable of the Good Samaritan, showing the power of compassion.',
    label: VideoLabel.shortFilm
  }
}

export const BehindTheScenes: Story = {
  args: {
    title: 'Making of The Life of Jesus',
    description:
      'Go behind the scenes to see how this epic film was made, from casting to special effects.',
    label: VideoLabel.behindTheScenes
  }
}
