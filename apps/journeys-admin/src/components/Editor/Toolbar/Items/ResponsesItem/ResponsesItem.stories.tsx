import { MockedResponse } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/nextjs'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { publishedJourney } from '@core/journeys/ui/TemplateView/data'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import {
  GetJourneyVisitorsCountWithTextResponses,
  GetJourneyVisitorsCountWithTextResponsesVariables
} from '../../../../../../__generated__/GetJourneyVisitorsCountWithTextResponses'

import {
  GET_JOURNEY_VISITORS_COUNT_WITH_TEXT_RESPONSES,
  ResponsesItem
} from './ResponsesItem'

const Demo: Meta<typeof ResponsesItem> = {
  ...simpleComponentConfig,
  component: ResponsesItem,
  title: 'Journeys-Admin/Editor/Toolbar/Items/ResponsesItem'
}

const getVisitorCountMock: MockedResponse<
  GetJourneyVisitorsCountWithTextResponses,
  GetJourneyVisitorsCountWithTextResponsesVariables
> = {
  request: {
    query: GET_JOURNEY_VISITORS_COUNT_WITH_TEXT_RESPONSES,
    variables: {
      filter: { journeyId: 'journey-id', hasTextResponse: true }
    }
  },
  result: {
    data: { journeyVisitorCount: 153 }
  }
}

const Template: StoryObj<typeof ResponsesItem> = {
  render: () => (
    <JourneyProvider value={{ journey: publishedJourney, variant: 'admin' }}>
      <Box
        sx={{
          p: 6,
          backgroundColor: 'background.paper'
        }}
      >
        <ResponsesItem variant="icon-button" />
      </Box>
    </JourneyProvider>
  )
}

export const Default = {
  ...Template,
  parameters: {
    apolloClient: {
      mocks: []
    }
  }
}

export const WithCount = {
  ...Template,
  parameters: {
    apolloClient: {
      mocks: [getVisitorCountMock]
    }
  }
}

export default Demo
