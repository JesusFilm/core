import { Story, Meta } from '@storybook/react'
import { journeysAdminConfig } from '../../../libs/storybook'
import { ActionsTable } from '.'

const ActionsTableStory = {
  ...journeysAdminConfig,
  component: ActionsTable,
  title: 'Journeys-Admin/Editor/ActionsTable'
}

const Template: Story = () => <ActionsTable />

export const Default = Template.bind({})

export default ActionsTableStory as Meta