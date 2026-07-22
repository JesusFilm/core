import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/nextjs-vite'
import { SnackbarProvider } from 'notistack'
import { ComponentProps } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { JourneyFields as Journey } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'

import { journeysConfig } from '../../libs/storybook'
import { basic } from '../../libs/testData/storyData'

import { WebsiteView } from '.'

const Demo: Meta<typeof WebsiteView> = {
  ...journeysConfig,
  component: WebsiteView,
  title: 'Journeys/WebsiteView',
  parameters: {
    ...journeysConfig.parameters,
    layout: 'fullscreen'
  }
}

type Story = StoryObj<ComponentProps<typeof WebsiteView> & { journey: Journey }>

const Template: Story = {
  render: ({ journey, ...props }) => {
    return (
      <MockedProvider>
        <JourneyProvider value={{ journey }}>
          <SnackbarProvider>
            <WebsiteView {...props} />
          </SnackbarProvider>
        </JourneyProvider>
      </MockedProvider>
    )
  }
}

const journey = {
  __typename: 'Journey',
  id: 'journeyId',
  title: 'my journey',
  website: true,
  language: {
    __typename: 'Language',
    id: '529'
  }
} as unknown as Journey

export const Default = {
  ...Template,
  args: {
    journey,
    blocks: basic,
    stepBlock: basic[0]
  }
}

export default Demo
