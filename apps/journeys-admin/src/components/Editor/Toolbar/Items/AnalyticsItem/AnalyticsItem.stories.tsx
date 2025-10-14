import { MockLink } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { formatISO } from 'date-fns'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import {
  defaultJourney,
  publishedJourney
} from '@core/journeys/ui/TemplateView/data'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import {
  GetJourneyPlausibleVisitors,
  GetJourneyPlausibleVisitorsVariables
} from '../../../../../../__generated__/GetJourneyPlausibleVisitors'

import { AnalyticsItem, GET_JOURNEY_PLAUSIBLE_VISITORS } from './AnalyticsItem'

const mockFormatISO = fn(formatISO)

const Demo: Meta<typeof AnalyticsItem> = {
  ...simpleComponentConfig,
  component: AnalyticsItem,
  async beforeEach() {
    mockFormatISO.mockReturnValue('2024-09-26')
    // 👇 Reset the mock after each story
    return () => {
      mockFormatISO.mockClear()
    }
  },
  title: 'Journeys-Admin/Editor/Toolbar/Items/AnalyticsItem'
}

const getJourneyPlausibleVisitorsMock: MockLink.MockedResponse<
  GetJourneyPlausibleVisitors,
  GetJourneyPlausibleVisitorsVariables
> = {
  request: {
    query: GET_JOURNEY_PLAUSIBLE_VISITORS,
    variables: {
      id: defaultJourney.id,
      date: '2024-06-01,2024-09-26'
    }
  },
  result: {
    data: {
      journeyAggregateVisitors: {
        __typename: 'PlausibleStatsAggregateResponse',
        visitors: {
          __typename: 'PlausibleStatsAggregateValue',
          value: 10
        }
      }
    }
  }
}

const Template: StoryObj<typeof AnalyticsItem> = {
  render: ({ ...args }) => (
    <JourneyProvider value={{ journey: publishedJourney, variant: 'admin' }}>
      <Box
        sx={{
          p: 6,
          backgroundColor: 'background.paper'
        }}
      >
        <AnalyticsItem {...args} />
      </Box>
    </JourneyProvider>
  )
}

export const Default = {
  ...Template,
  args: {
    variant: 'icon-button'
  },
  parameters: {
    apolloClient: {
      mocks: []
    }
  }
}

export const WithVisitors = {
  ...Template,
  args: {
    variant: 'icon-button'
  },
  parameters: {
    apolloClient: {
      mocks: [getJourneyPlausibleVisitorsMock]
    }
  }
}

export default Demo
