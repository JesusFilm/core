import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { JourneyStatus } from '../../../__generated__/globalTypes'
import { cache } from '../../libs/apolloClient/cache'
import { journeysAdminConfig } from '../../libs/storybook'
import { GET_ADMIN_JOURNEYS } from '../../libs/useAdminJourneysQuery/useAdminJourneysQuery'
import { PageWrapper } from '../PageWrapper'

import { JourneyListProps } from './JourneyList'
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

const Template: StoryObj<
  ComponentProps<typeof JourneyList> & { props: JourneyListProps }
> = {
  render: ({ ...args }) => (
    <PageWrapper title="Active Journeys">
      <JourneyList {...args.props} />
    </PageWrapper>
  )
}

export const Default = {
  ...Template,
  args: {
    props: {
      journeys: [
        defaultJourney,
        publishedJourney,
        oldJourney,
        descriptiveJourney
      ],
      event: ''
    }
  },
  parameters: {
    apolloClient: {
      cache: cache(),
      mocks: [
        {
          request: {
            query: GET_ADMIN_JOURNEYS,
            variables: {
              status: [JourneyStatus.draft, JourneyStatus.published]
            }
          },
          result: {
            data: {
              journeys: [
                defaultJourney,
                publishedJourney,
                oldJourney,
                descriptiveJourney
              ]
            }
          }
        }
      ]
    }
  }
}

export const NoJourneys = {
  ...Template,
  args: {
    props: {
      journeys: [],
      event: ''
    }
  },
  parameters: {
    apolloClient: {
      cache: cache(),
      mocks: []
    }
  }
}

export default JourneyListStory
