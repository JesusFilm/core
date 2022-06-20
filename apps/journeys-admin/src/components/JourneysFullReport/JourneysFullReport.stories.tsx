import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import fetch from 'node-fetch'
import { JourneysReportType } from '../../../__generated__/globalTypes'
import { journeysAdminConfig } from '../../libs/storybook'
import { GET_ADMIN_JOURNEYS_REPORT } from '../PowerBiReport/PowerBiReport'
import { JourneysFullReport } from '.'

const JourneysFullReportStory = {
  ...journeysAdminConfig,
  component: JourneysFullReport,
  title: 'Journeys-Admin/JourneysFullReport'
}

const Template: Story = ({ loaded }) => {
  console.log(loaded)
  return (
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
                embedUrl: loaded.embedUrl,
                accessToken: loaded.accessToken
              }
            }
          }
        }
      ]}
    >
      <JourneysFullReport />
    </MockedProvider>
  )
}

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

export default JourneysFullReportStory as Meta
