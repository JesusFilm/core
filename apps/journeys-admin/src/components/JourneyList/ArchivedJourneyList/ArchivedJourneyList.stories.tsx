import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { GetJourneysAdmin } from '../../../../__generated__/GetJourneysAdmin'
import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { journeysAdminConfig } from '../../../libs/storybook'
import { GET_JOURNEYS_ADMIN } from '../../../libs/useJourneysAdminQuery/useJourneysAdminQuery'
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
    mocks: [MockedResponse<GetJourneysAdmin>]
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
          query: GET_JOURNEYS_ADMIN,
          variables: {
            status: [JourneyStatus.archived]
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
          query: GET_JOURNEYS_ADMIN,
          variables: {
            status: [JourneyStatus.archived]
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

export const Loading = {
  ...Template,
  args: {
    mocks: []
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
