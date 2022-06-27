import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import fetch from 'node-fetch'
import noop from 'lodash/noop'
import { JourneysReportType } from '../../../../__generated__/globalTypes'
import { journeysAdminConfig } from '../../../libs/storybook'
import { RemoteProps, GET_ADMIN_JOURNEYS_REPORT } from './Remote'
import { Remote } from '.'

const RemoteStory = {
  ...journeysAdminConfig,
  component: Remote,
  title: 'Journeys-Admin/PowerBiReport/Remote'
}

const Template: Story = (
  { ...args }: RemoteProps,
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
    <Remote {...args} />
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

export default RemoteStory as Meta
