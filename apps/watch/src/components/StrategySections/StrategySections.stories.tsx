import { Meta, StoryObj } from '@storybook/react'
import { StrategySections } from './StrategySections'

import { InstantSearchTestWrapper } from '@core/journeys/ui/mocks/InstantSearchWrapper'
import { watchConfig } from '../../libs/storybook'

const StrategySectionsStory: Meta<typeof StrategySections> = {
  ...watchConfig,
  component: StrategySections,
  title: 'Watch/StrategySections'
}

const Template: StoryObj = {
  render: () => (
    <InstantSearchTestWrapper>
      <StrategySections />
    </InstantSearchTestWrapper>
  )
}

export const Default = {
  ...Template
}

export default StrategySectionsStory
