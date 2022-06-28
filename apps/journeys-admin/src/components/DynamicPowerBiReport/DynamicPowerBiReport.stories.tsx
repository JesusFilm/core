import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import fetch from 'node-fetch'
import { JourneysReportType } from '../../../__generated__/globalTypes'
import { journeysAdminConfig } from '../../libs/storybook'
import { ApolloLoadingProvider } from '../../../test/ApolloLoadingProvider'
import { GET_ADMIN_JOURNEYS_REPORT } from './Report/Report'
import { DynamicPowerBiReport } from '.'

const PowerBiReportStory = {
  ...journeysAdminConfig,
  component: DynamicPowerBiReport,
  title: 'Journeys-Admin/PowerBiReport'
}

const Template: Story = (
  { ...args },
  { loaded: { embedUrl, accessToken } }
) => {
  const reportMocks = [
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
  ]
  const errorMocks = [
    {
      request: {
        query: GET_ADMIN_JOURNEYS_REPORT,
        variables: { reportType: JourneysReportType.multipleFull }
      },
      error: {
        name: 'ERROR_FETCHING',
        message: 'There was an error retriving the report'
      }
    }
  ]

  const mocks = args.type === 'error' ? errorMocks : reportMocks

  if (args.type === 'loading') {
    return (
      <ApolloLoadingProvider>
        <DynamicPowerBiReport reportType={JourneysReportType.multipleFull} />
      </ApolloLoadingProvider>
    )
  } else {
    return (
      <MockedProvider mocks={mocks}>
        <DynamicPowerBiReport reportType={JourneysReportType.multipleFull} />
      </MockedProvider>
    )
  }
}

const loaders = [
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

export const Default = Template.bind({})
Default.loaders = loaders
Default.args = {
  type: 'report'
}
Default.parameters = {
  chromatic: { delay: 30000 }
}

export const Loading = Template.bind({})
Loading.loaders = loaders
Loading.args = {
  type: 'loading'
}

export const Error = Template.bind({})
Error.loaders = loaders
Error.args = {
  type: 'error'
}

export default PowerBiReportStory as Meta
