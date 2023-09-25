import { Meta, StoryObj } from '@storybook/react'
import { StrategySlugUpdateForm } from './StrategySlugUpdateForm'
import { simpleComponentConfig } from '../../../libs/storybook'
import { screen, userEvent } from '@storybook/testing-library'
import { ComponentProps } from 'react'
import { JourneyFields as Journey } from '../../../../__generated__/JourneyFields'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { MockedProvider } from '@apollo/client/testing/react/MockedProvider'
import { defaultJourney } from '../../JourneyView/data'

const StrategySlugUpdateFormStory: Meta<typeof StrategySlugUpdateForm> = {
  ...simpleComponentConfig,
  component: StrategySlugUpdateForm,
  title: 'Journeys-Admin/Editor/StrategySlugUpdateFormStory'
}

const Template: StoryObj<
  ComponentProps<typeof StrategySlugUpdateForm> & { journey: Journey }
> = {
  render: (args) => (
    <JourneyProvider
      value={{
        journey: args.journey,
        variant: 'admin'
      }}
    >
      <StrategySlugUpdateForm />
    </JourneyProvider>
  )
}

export const Default = {
  ...Template
}

export const Filled = {
  ...Template,
  args: {
    journey: {
      ...defaultJourney,
      strategySlug: 'https://www.canva.com/design/DAFvDBw1z1A/view'
    }
  }
}

export const Error = {
  ...Template,
  play: async () => {
    await userEvent.type(screen.getByRole('textbox'), ' error')
  }
}

export default StrategySlugUpdateFormStory
