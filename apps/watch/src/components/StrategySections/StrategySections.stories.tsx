import { Meta, StoryObj } from '@storybook/react'
import { StrategySections } from './StrategySections'

import { watchConfig } from '../../libs/storybook'

const StrategySectionsStory: Meta<typeof StrategySections> = {
  ...watchConfig,
  component: StrategySections,
  title: 'Watch/StrategySections'
}

const Template: StoryObj = {
  render: () => <StrategySections />
}

export const Default = {
  ...Template
}

export default StrategySectionsStory
