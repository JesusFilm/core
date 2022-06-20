import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import fetch from 'node-fetch'
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

const Template: Story = (
  { ...args }: PowerBiReportProps,
  { loaded: { embedUrl, accessToken } }
) => (
  <MockedProvider
    mocks={[
      {
        request: {
          query: GET_ADMIN_JOURNEYS_REPORT,
          variables: { reportType: JourneysReportType.multipleFull }
        },
        result: {
          data: {
            adminJourneysReport: {
              embedUrl,
              accessToken
            }
          }
        }
      }
    ]}
  >
    <PowerBiReport {...args} />
  </MockedProvider>
)

export const Default = Template.bind({})
Default.loaders = [
  async () => {
    const response = await (
      await fetch(
        'https://playgroundbe-bck-1.azurewebsites.net/Reports/SampleReport'
      )
    ).json()
    return {
      embedUrl: response.EmbedUrl,
      accessToken: response.EmbedToken.Token
    }
  }
]
Default.args = {
  reportType: JourneysReportType.multipleFull,
  onLoad: noop,
  onError: noop
}

export default PowerBiReportStory as Meta
