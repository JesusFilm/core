import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { ApolloLoadingProvider } from '../../../../../../test/ApolloLoadingProvider'
import { simpleComponentConfig } from '../../../../../libs/storybook'
import { publishedJourney } from '../../../data'

import { StrategyItem } from './StrategyItem'

const Demo: Meta<typeof StrategyItem> = {
  ...simpleComponentConfig,
  component: StrategyItem,
  title: 'Journeys-Admin/Editor/Toolbar/Items/StrategyItem'
}

const Template: StoryObj<typeof StrategyItem> = {
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
            <StrategyItem {...args} />
          </Box>
        </JourneyProvider>
      </MockedProvider>
    </ApolloLoadingProvider>
  )
}

export const Default = {
  ...Template,
  args: {
    variant: 'button'
  }
}

export default Demo
