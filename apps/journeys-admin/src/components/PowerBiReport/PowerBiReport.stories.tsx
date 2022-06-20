import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import noop from 'lodash/noop'
import { JourneysReportType } from '../../../__generated__/globalTypes'
import { journeysAdminConfig } from '../../libs/storybook'
import { PowerBiReportProps, GET_ADMIN_JOURNEYS_REPORT } from './PowerBiReport'
import { PowerBiReport } from '.'

const PowerBiReportStory = {
  ...journeysAdminConfig,
  component: PowerBiReport,
  title: 'Journeys-Admin/PowerBiReport'
}

const Template: Story = ({ ...args }: PowerBiReportProps) => (
  <MockedProvider
  // mocks={[
  //   {
  //     request: {
  //       query: GET_ADMIN_JOURNEYS_REPORT,
  //       variables: { reportType: JourneysReportType.multipleFull }
  //     },
  //     result: {
  //       data: {
  //         adminJourneysReport: {
  //           embedUrl:
  //             'https://app.powerbi.com/reportEmbed?reportId=f6bfd…leHQiOnRydWUsInNraXBab25lUGF0Y2giOnRydWV9fQ%3d%3d',
  //           accessToken:
  //             'H4sIAAAAAAAEACWWxc7GjK2E7-XfplKYKnURZubswoxvuDr3fj…lbWJlZEZlYXR1cmVzIjp7Im1vZGVybkVtYmVkIjpmYWxzZX19'
  //         }
  //       }
  //     }
  //   }
  // ]}
  >
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
