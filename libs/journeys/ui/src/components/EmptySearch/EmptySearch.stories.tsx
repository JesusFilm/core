import type { Meta, StoryObj } from '@storybook/react'
import type { ComponentProps } from 'react'

import { watchConfig } from '@core/shared/ui/storybook/config'

import { EmptySearch } from './EmptySearch'

const EmptySearchStory: Meta<typeof EmptySearch> = {
  ...watchConfig,
  component: EmptySearch,
  title: 'Journeys-Ui/EmptySearch'
}

const Template: StoryObj<ComponentProps<typeof EmptySearch>> = {
  render: () => <EmptySearch />
}

export const Default = {
  ...Template
}

export default EmptySearchStory
