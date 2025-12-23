import type { MockedResponse } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import type { Meta, StoryObj } from '@storybook/nextjs'
import type { ComponentPropsWithRef } from 'react'

import { simpleComponentConfig } from '@core/shared/ui/storybook'

import type {
  GetAdminJourneyWithPlausibleToken,
  GetAdminJourneyWithPlausibleToken_journey as Journey
} from '../../../__generated__/GetAdminJourneyWithPlausibleToken'
import { ApolloLoadingProvider } from '../../../test/ApolloLoadingProvider'

import {
  GET_ADMIN_JOURNEY_WITH_PLAUSIBLE_TOKEN,
  PlausibleEmbedDashboard
} from './PlausibleEmbedDashboard'

const PlausibleEmbedDashboardStory: Meta<typeof PlausibleEmbedDashboard> = {
  ...simpleComponentConfig,
  component: PlausibleEmbedDashboard,
  title: 'Journeys-Admin/PlausibleEmbedDashboard'
}

const journey = {
  __typename: 'Journey',
  title: 'Fact or Fiction - Stage',
  id: '1',
  plausibleToken: '3Q7Nfj1AlMJjeIA48AUhR'
} as unknown as Journey

const adminJourneyMock: MockedResponse<GetAdminJourneyWithPlausibleToken> = {
  request: {
    query: GET_ADMIN_JOURNEY_WITH_PLAUSIBLE_TOKEN,
    variables: {
      id: '1'
    }
  },
  result: {
    data: {
      journey
    }
  }
}
const Template: StoryObj<
  ComponentPropsWithRef<typeof PlausibleEmbedDashboard>
> = {
  render: (args) => {
    return (
      <Box sx={{ width: '900px' }}>
        <PlausibleEmbedDashboard {...args} />
      </Box>
    )
  }
}

export const Default = {
  ...Template,
  args: {
    host: 'https://analytics.stage.central.jesusfilm.org'
  },
  parameters: {
    chromatic: { disableSnapshot: true },
    apolloClient: { mocks: [adminJourneyMock] },
    nextjs: {
      router: {
        query: {
          journeyId: journey.id
        }
      }
    }
  }
}

export const Loading: StoryObj<
  ComponentPropsWithRef<typeof PlausibleEmbedDashboard>
> = {
  render: () => {
    return (
      <ApolloLoadingProvider>
        <PlausibleEmbedDashboard />
      </ApolloLoadingProvider>
    )
  }
}

export const Error = {
  ...Template,
  args: {},
  parameters: {
    apolloClient: {
      mocks: []
    },
    nextjs: {
      router: {
        query: {
          journeyId: journey.id
        }
      }
    }
  }
}

export default PlausibleEmbedDashboardStory
