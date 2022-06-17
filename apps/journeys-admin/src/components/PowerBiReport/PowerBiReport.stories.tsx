import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import noop from 'lodash/noop'
import { JourneysReportType } from '../../../__generated__/globalTypes'
import { journeysAdminConfig } from '../../libs/storybook'
import { PowerBiReportProps } from './PowerBiReport'
import { PowerBiReport } from '.'

const PowerBiReportStory = {
  ...journeysAdminConfig,
  component: PowerBiReport,
  title: 'Journeys-Admin/PowerBiReport'
}

const Template: Story = ({ ...args }: PowerBiReportProps) => (
  <MockedProvider>
    <PowerBiReport {...args} />
  </MockedProvider>
)

export const Default = Template.bind({})
Default.args = {
  reportType: JourneysReportType.multipleFull,
  onLoad: noop,
  onError: noop
}

export default PowerBiReportStory as Meta
