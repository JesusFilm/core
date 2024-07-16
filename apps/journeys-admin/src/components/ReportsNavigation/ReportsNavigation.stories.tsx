import { Meta, StoryObj } from '@storybook/react'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { ReportsNavigation } from '.'

const ReportsNavigationStory: Meta<typeof ReportsNavigation> = {
  ...journeysAdminConfig,
  component: ReportsNavigation,
  title: 'Journeys-Admin/ReportsNavigation'
}

const Template: StoryObj<typeof ReportsNavigation> = {
  render: ({ ...args }) => <ReportsNavigation {...args} />
}

export const Default = {
  ...Template,
  args: {
    journeyId: 'journeyId'
  }
}

export default ReportsNavigationStory
