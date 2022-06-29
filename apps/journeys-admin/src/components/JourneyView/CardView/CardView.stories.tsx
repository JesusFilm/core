import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { journeysAdminConfig } from '../../../libs/storybook'
import { ThemeMode, ThemeName } from '../../../../__generated__/globalTypes'
import { GetJourney_journey as Journey } from '../../../../__generated__/GetJourney'
import { CardView, CardViewProps } from './CardView'
import { steps } from './data'

const CardViewStory = {
  ...journeysAdminConfig,
  component: CardView,
  title: 'Journeys-Admin/JourneyView/CardView'
}

const Template: Story<Omit<CardViewProps, 'id'>> = ({ ...args }) => (
  <MockedProvider>
    <JourneyProvider
      value={{
        journey: {
          id: 'journeyId',
          themeMode: ThemeMode.dark,
          themeName: ThemeName.base
        } as unknown as Journey,
        admin: true
      }}
    >
      <CardView id="journeyId" {...args} />
    </JourneyProvider>
  </MockedProvider>
)

export const Default = Template.bind({})
Default.args = {
  blocks: steps
}

export const NoCards = Template.bind({})
NoCards.args = {
  blocks: []
}

export const ManyCards = Template.bind({})
ManyCards.args = {
  blocks: steps.concat(steps).concat(steps)
}

export const Loading = Template.bind({})
Loading.args = {
  blocks: undefined
}

export default CardViewStory as Meta
