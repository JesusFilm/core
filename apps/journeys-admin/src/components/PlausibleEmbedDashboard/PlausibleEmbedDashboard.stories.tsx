import type { MockedResponse } from '@apollo/client/testing'
import { journeysAdminConfig } from '@core/shared/ui/storybook'
import type { Meta, StoryObj } from '@storybook/react'
import type { ComponentPropsWithRef } from 'react'
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
  ...journeysAdminConfig,
  component: PlausibleEmbedDashboard,
  title: 'Journeys-Admin/PlausibleEmbedDashboard'
}

const journey = {
  __typename: 'Journey',
  id: 'journey.id',
  plausibleToken: 'plausible-token'
} as unknown as Journey

const adminJourneyMock: MockedResponse<GetAdminJourneyWithPlausibleToken> = {
  request: {
    query: GET_ADMIN_JOURNEY_WITH_PLAUSIBLE_TOKEN,
    variables: {
      id: 'journeyId'
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
  render: () => {
    return <PlausibleEmbedDashboard />
  }
}

export const Default = {
  ...Template,
  args: {},
  parameters: {
    chromatic: { disableSnapshot: true },
    apolloClient: { mocks: [adminJourneyMock] },
    nextjs: {
      router: {
        query: {
          journeyId: 'journeyId'
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
          journeyId: 'journeyId'
        }
      }
    }
  }
}

export default PlausibleEmbedDashboardStory
