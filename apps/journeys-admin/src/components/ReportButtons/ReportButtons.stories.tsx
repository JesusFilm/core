import { Story, Meta } from '@storybook/react'
import { simpleComponentConfig } from '../../libs/storybook'
import { ReportButtons } from './ReportButtons'

const ReportButtonsStory = {
  ...simpleComponentConfig,
  component: ReportButtons,
  title: 'Journeys-Admin/ReportButtons'
}

const Template: Story = () => <ReportButtons selected="journeys" />

export const Default = Template.bind({})
export default ReportButtonsStory as Meta
