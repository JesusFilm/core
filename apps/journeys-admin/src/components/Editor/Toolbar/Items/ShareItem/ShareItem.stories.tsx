import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/nextjs'
import { screen, userEvent } from 'storybook/test'
import { ComponentProps } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { publishedJourney } from '@core/journeys/ui/TemplateView/data'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { ApolloLoadingProvider } from '../../../../../../test/ApolloLoadingProvider'

import { ShareItem } from './ShareItem'

const Demo: Meta<typeof ShareItem> = {
  ...simpleComponentConfig,
  component: ShareItem,
  title: 'Journeys-Admin/Editor/Toolbar/Items/ShareItem'
}

const Template: StoryObj<ComponentProps<typeof ShareItem>> = {
  render: (args) => (
    <ApolloLoadingProvider>
      <MockedProvider>
        <JourneyProvider
          value={{ journey: publishedJourney, variant: 'admin' }}
        >
          <Box sx={{ p: 6, backgroundColor: 'background.paper' }}>
            <ShareItem {...args} />
          </Box>
        </JourneyProvider>
      </MockedProvider>
    </ApolloLoadingProvider>
  )
}

export const Default = {
  ...Template,
  args: { variant: 'button' }
}

export const Open = {
  ...Template,
  args: { variant: 'button' },
  play: async () => {
    const button = screen.getByRole('button', { name: 'Share' })
    await userEvent.click(button)
  }
}

export default Demo
