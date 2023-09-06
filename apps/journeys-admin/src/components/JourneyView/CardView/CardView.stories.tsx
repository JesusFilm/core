import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { GetJourney_journey as Journey } from '../../../../__generated__/GetJourney'
import { ThemeMode, ThemeName } from '../../../../__generated__/globalTypes'
import { journeysAdminConfig } from '../../../libs/storybook'

import { CardView, CardViewProps } from './CardView'
import { steps } from './data'

const CardViewStory: Meta<typeof CardView> = {
  ...journeysAdminConfig,
  component: CardView,
  title: 'Journeys-Admin/JourneyView/CardView'
}

const Template: StoryObj<Omit<CardViewProps, 'id'>> = {
  render: ({ ...args }) => (
    <MockedProvider>
      <JourneyProvider
        value={{
          journey: {
            id: 'journeyId',
            themeMode: ThemeMode.dark,
            themeName: ThemeName.base,
            language: {
              __typename: 'Language',
              bcp47: 'en'
            }
          } as unknown as Journey,
          variant: 'admin'
        }}
      >
        <CardView id="journeyId" {...args} />
      </JourneyProvider>
    </MockedProvider>
  )
}

export const Default = {
  ...Template,
  args: {
    blocks: steps
  }
}

export const NoCards = {
  ...Template,
  args: {
    blocks: []
  }
}

export const ManyCards = {
  ...Template,
  args: {
    blocks: steps.concat(steps).concat(steps)
  }
}

export const Loading = {
  ...Template,
  args: {
    blocks: undefined
  }
}

export default CardViewStory
