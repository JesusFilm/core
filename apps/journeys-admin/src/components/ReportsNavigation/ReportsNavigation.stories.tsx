import { Meta, StoryObj } from '@storybook/nextjs'

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

export const Journey = {
  ...Template,
  args: {
    destination: 'journey',
    journeyId: 'journeyId'
  }
}

export const Visitor = {
  ...Template,
  args: {
    destination: 'visitor',
    journeyId: 'journeyId'
  }
}

export default ReportsNavigationStory
