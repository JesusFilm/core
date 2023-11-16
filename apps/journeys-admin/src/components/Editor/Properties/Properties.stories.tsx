import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'


import { GetJourney_journey as Journey } from '../../../../__generated__/GetJourney'
import { journeysAdminConfig } from '../../../libs/storybook'
import { publishedJourney } from '../data'

import { Properties } from './Properties'

const PropertiesStory: Meta<typeof Properties> = {
  ...journeysAdminConfig,
  component: Properties,
  title: 'Journeys-Admin/Properties',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: StoryObj<
  ComponentProps<typeof Properties> & { journey: Journey }
> = {
  render: ({ ...args }) => (
    <MockedProvider mocks={[]}>
      
        <JourneyProvider value={{ journey: args.journey, variant: 'admin' }}>
          <Properties {...args} />
        </JourneyProvider>
      </FlagsProvider>
    </MockedProvider>
  )
}
export const Default = {
  ...Template,
  args: {
    journey: publishedJourney
  }
}

export const Loading = {
  ...Template,
  args: {
    journey: undefined
  }
}

export default PropertiesStory
