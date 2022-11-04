import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { journeysAdminConfig } from '../../libs/storybook'
import { ReportButtons } from "./ReportButtons"

const ReportButtonsStory = {
  ...journeysAdminConfig,
  component: ReportButtons,
  title: 'Journeys-Admin/reportButtons'
  
}

const Template: Story = ({ ...args }) => (
  <MockedProvider>
    <ReportButtons pageName="reports" />
  </MockedProvider>
)

export const Default = Template.bind({})
export default ReportButtonsStory as Meta
