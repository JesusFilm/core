import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { GetAdminJourneys } from '../../../../__generated__/GetAdminJourneys'
import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { journeysAdminConfig } from '../../../libs/storybook'
import { GET_ADMIN_JOURNEYS } from '../../../libs/useAdminJourneysQuery/useAdminJourneysQuery'
import { JourneyListProps } from '../JourneyList'
import {
  defaultJourney,
  descriptiveJourney,
  oldJourney,
  publishedJourney
} from '../journeyListData'

import { ArchivedJourneyList } from '.'

const ArchivedJourneyListStory: Meta<typeof ArchivedJourneyList> = {
  ...journeysAdminConfig,
  component: ArchivedJourneyList,
  title: 'Journeys-Admin/JourneyList/StatusTabPanel/ArchivedJourneyList',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: StoryObj<
  ComponentProps<typeof ArchivedJourneyList> & {
    props: JourneyListProps
    mocks: [MockedResponse<GetAdminJourneys>]
  }
> = {
  render: ({ ...args }) => (
    <MockedProvider mocks={args.mocks}>
      <ArchivedJourneyList {...args.props} />
    </MockedProvider>
  )
}
export const Default = {
  ...Template,
  args: {
    mocks: [
      {
        request: {
          query: GET_ADMIN_JOURNEYS,
          variables: {
            status: [JourneyStatus.archived],
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
    ]
  }
}

export const NoJourneys = {
  ...Template,
  args: {
    mocks: [
      {
        request: {
          query: GET_ADMIN_JOURNEYS,
          variables: {
            status: [JourneyStatus.archived],
            useLastActiveTeamId: true
          }
        },
        result: {
          data: {
            journeys: []
          }
        }
      }
    ]
  }
}

export const UnarchiveAll = {
  ...Template,
  args: {
    props: {
      event: 'restoreAllArchived'
    },
    mocks: []
  }
}

export const TrashAll = {
  ...Template,
  args: {
    props: {
      event: 'trashAllArchived'
    },
    mocks: []
  }
}

export default ArchivedJourneyListStory
