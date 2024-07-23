import { watchConfig } from '@core/shared/ui/storybook'
import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'
import { NoResultsFound } from './NoResultsFound'

const NoResultsFoundStory: Meta<typeof NoResultsFound> = {
  ...watchConfig,
  component: NoResultsFound,
  title: 'Journeys-Ui/NoResultsFound'
}

const Template: StoryObj<ComponentProps<typeof NoResultsFound>> = {
  render: () => <NoResultsFound />
}

export const Default = {
  ...Template
}

export default NoResultsFoundStory
