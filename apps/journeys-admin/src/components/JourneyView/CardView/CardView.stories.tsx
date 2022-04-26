import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { journeysAdminConfig } from '../../../libs/storybook'
import { JourneyProvider } from '../../../libs/context'
import { ThemeMode, ThemeName } from '../../../../__generated__/globalTypes'
import { GetJourney_journey as Journey } from '../../../../__generated__/GetJourney'
import { CardView, CardViewProps } from './CardView'
import { steps } from './data'

const CardViewStory = {
  ...journeysAdminConfig,
  component: CardView,
  title: 'Journeys-Admin/JourneyView/CardView'
}

const Template: Story<Omit<CardViewProps, 'slug'>> = ({ ...args }) => (
  <MockedProvider>
    <JourneyProvider
      value={
        {
          id: 'journeyId',
          themeMode: ThemeMode.dark,
          themeName: ThemeName.base
        } as unknown as Journey
      }
    >
      <CardView slug="my-journey" {...args} />
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
