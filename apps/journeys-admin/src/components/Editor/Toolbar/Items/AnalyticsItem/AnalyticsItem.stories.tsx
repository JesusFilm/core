import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { formatISO } from 'date-fns'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { publishedJourney } from '@core/journeys/ui/TemplateView/data'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { AnalyticsItem } from './AnalyticsItem'
import { getJourneyPlausibleVisitorsMock } from './AnalyticsItem.spec'

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
