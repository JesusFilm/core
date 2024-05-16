import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { ApolloLoadingProvider } from '../../../../../../test/ApolloLoadingProvider'
import { simpleComponentConfig } from '../../../../../libs/storybook'
import { publishedJourney } from '../../../data'

import { PreviewItem } from './PreviewItem'

const Demo: Meta<typeof PreviewItem> = {
  ...simpleComponentConfig,
  component: PreviewItem,
  title: 'Journeys-Admin/Editor/Toolbar/Items/PreviewItem'
}

const Template: StoryObj<typeof PreviewItem> = {
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
            <PreviewItem {...args} />
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
