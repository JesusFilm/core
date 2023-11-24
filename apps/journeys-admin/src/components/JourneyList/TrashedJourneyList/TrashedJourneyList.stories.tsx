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

import { TrashedJourneyList } from '.'

const TrashedJourneyListStory: Meta<typeof TrashedJourneyList> = {
  ...journeysAdminConfig,
  component: TrashedJourneyList,
  title: 'Journeys-Admin/JourneyList/StatusTabPanel/TrashedJourneyList',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: StoryObj<
  ComponentProps<typeof TrashedJourneyList> & {
    props: JourneyListProps
    mocks: [MockedResponse<GetAdminJourneys>]
  }
> = {
  render: ({ ...args }) => (
    <MockedProvider mocks={args.mocks}>
      <TrashedJourneyList {...args.props} />
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
            status: [JourneyStatus.trashed]
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
            status: [JourneyStatus.trashed]
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

export const RestoreAll = {
  ...Template,
  args: {
    props: {
      event: 'restoreAllTrashed'
    },
    mocks: []
  }
}

export const DeleteAll = {
  ...Template,
  args: {
    props: {
      event: 'deleteAllTrashed'
    },
    mocks: []
  }
}

export default TrashedJourneyListStory
