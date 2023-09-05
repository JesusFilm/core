import { Meta, StoryObj } from '@storybook/react'

import { simpleComponentConfig } from '../../libs/storybook'

import { ReportsNavigation } from '.'

const ReportsNavigationStory: Meta<typeof ReportsNavigation> = {
  ...simpleComponentConfig,
  component: ReportsNavigation,
  title: 'Journeys-Admin/ReportsNavigation'
}

const Template: StoryObj<typeof ReportsNavigation> = {
  render: ({ ...args }) => <ReportsNavigation {...args} />
}

export const Default = {
  ...Template,
  args: {
    selected: 'journeys'
  }
}

export default ReportsNavigationStory
