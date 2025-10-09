import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/nextjs'
import fetch from 'node-fetch'
import { ComponentProps } from 'react'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { JourneysReportType } from '../../../../__generated__/globalTypes'
import { ApolloLoadingProvider } from '../../../../test/ApolloLoadingProvider'

import { GET_ADMIN_JOURNEYS_REPORT } from './Report'

import { Report } from '.'

const ReportStory: Meta<typeof Report> = {
  ...journeysAdminConfig,
  component: Report,
  title: 'Journeys-Admin/PowerBiReport'
}

type Story = StoryObj<ComponentProps<typeof Report> & { type: string }>

const Template: Story = {
  render: ({ ...args }, context) => {
    const { embedUrl, accessToken } = context.loaded
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
          <Report reportType={JourneysReportType.multipleFull} />
        </ApolloLoadingProvider>
      )
    } else {
      return (
        <MockedProvider mocks={mocks}>
          <Report reportType={JourneysReportType.multipleFull} />
        </MockedProvider>
      )
    }
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

export const Default = {
  ...Template,
  loaders,
  args: {
    type: 'report'
  },
  parameters: {
    chromatic: { disableSnapshot: true }
  }
}

export const Loading = {
  ...Template,
  loaders,
  args: { type: 'loading' }
}

export const Error = {
  ...Template,
  loaders,
  args: {
    type: 'error'
  }
}

export default ReportStory
