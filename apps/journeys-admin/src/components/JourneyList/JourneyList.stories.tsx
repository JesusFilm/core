import { MockedResponse } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/nextjs'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import {
  GetAdminJourneys,
  GetAdminJourneysVariables
} from '../../../__generated__/GetAdminJourneys'
import { JourneyStatus } from '../../../__generated__/globalTypes'
import { cache } from '../../libs/apolloClient/cache'
import { GET_ADMIN_JOURNEYS } from '../../libs/useAdminJourneysQuery/useAdminJourneysQuery'
import { PageWrapper } from '../PageWrapper'

import {
  defaultJourney,
  descriptiveJourney,
  oldJourney,
  publishedJourney
} from './journeyListData'

import { JourneyList } from '.'

const JourneyListStory: Meta<typeof JourneyList> = {
  ...journeysAdminConfig,
  component: JourneyList,
  title: 'Journeys-Admin/JourneyList',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const getAdminJourneysMock: MockedResponse<
  GetAdminJourneys,
  GetAdminJourneysVariables
> = {
  request: {
    query: GET_ADMIN_JOURNEYS,
    variables: {
      status: [JourneyStatus.draft, JourneyStatus.published],
      useLastActiveTeamId: true
    }
  },
  result: {
    data: {
      journeys: [
        defaultJourney,
        oldJourney,
        descriptiveJourney,
        publishedJourney
      ]
    }
  }
}

const Template: StoryObj<typeof JourneyList> = {
  render: ({ ...args }) => (
    <PageWrapper title="Active Journeys">
      <JourneyList {...args} />
    </PageWrapper>
  ),
  parameters: {
    apolloClient: {
      cache: cache(),
      mocks: [getAdminJourneysMock]
    },
    docs: {
      source: {
        type: 'code'
      }
    }
  }
}

export const Default = {
  ...Template
}

export const NoJourneys = {
  ...Template,
  parameters: {
    ...Template.parameters,
    apolloClient: {
      cache: cache(),
      mocks: [
        {
          ...getAdminJourneysMock,
          result: {
            data: {
              journeys: []
            }
          }
        }
      ]
    }
  }
}

export default JourneyListStory
