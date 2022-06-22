import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import fetch from 'node-fetch'
import { JourneysReportType } from '../../../__generated__/globalTypes'
import { journeysAdminConfig } from '../../libs/storybook'
import { GET_ADMIN_JOURNEYS_REPORT } from '../PowerBiReport/PowerBiReport'
import { ApolloLoadingProvider } from '../../../test/ApolloLoadingProvider'
import { JourneysFullReport } from '.'

const JourneysFullReportStory = {
  ...journeysAdminConfig,
  component: JourneysFullReport,
  title: 'Journeys-Admin/JourneysFullReport'
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
        <JourneysFullReport />
      </ApolloLoadingProvider>
    )
  } else {
    return (
      <MockedProvider mocks={mocks}>
        <JourneysFullReport />
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
  chromatic: { delay: 10000 }
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

export default JourneysFullReportStory as Meta
