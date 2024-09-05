import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { publishedJourney } from '@core/journeys/ui/TemplateView/data'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { ApolloLoadingProvider } from '../../../../../../test/ApolloLoadingProvider'

import { ResponsesItem } from './ResponsesItem'

const Demo: Meta<typeof ResponsesItem> = {
  ...simpleComponentConfig,
  component: ResponsesItem,
  title: 'Journeys-Admin/Editor/Toolbar/Items/ResponsesItem'
}

const Template: StoryObj<typeof ResponsesItem> = {
  render: ({ ...args }) => (
    <ApolloLoadingProvider>
      <MockedProvider>
        <JourneyProvider
          value={{ journey: publishedJourney, variant: 'admin' }}
        >
          <Box
            sx={{
              p: 6,
              backgroundColor: 'background.paper'
            }}
          >
            <ResponsesItem {...args} />
          </Box>
        </JourneyProvider>
      </MockedProvider>
    </ApolloLoadingProvider>
  )
}

export const Default = {
  ...Template,
  args: {
    variant: 'icon-button'
  }
}

export default Demo
