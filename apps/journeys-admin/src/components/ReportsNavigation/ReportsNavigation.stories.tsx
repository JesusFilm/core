import { Meta, Story } from '@storybook/react'
import { ComponentProps } from 'react'

import { simpleComponentConfig } from '../../libs/storybook'

import { ReportsNavigation } from '.'

const ReportsNavigationStory = {
  ...simpleComponentConfig,
  title: 'Journeys-Admin/ReportsNavigation'
}

const Template: Story<ComponentProps<typeof ReportsNavigation>> = ({
  ...args
}) => <ReportsNavigation {...args} />

export const Default = Template.bind({})
Default.args = {
  selected: 'journeys'
}

export default ReportsNavigationStory as Meta
