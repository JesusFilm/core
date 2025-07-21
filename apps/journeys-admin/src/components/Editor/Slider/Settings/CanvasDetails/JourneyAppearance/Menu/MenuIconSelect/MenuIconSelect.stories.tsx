import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/nextjs'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { JourneyMenuButtonIcon } from '../../../../../../../../../__generated__/globalTypes'
import { JourneyFields as Journey } from '../../../../../../../../../__generated__/JourneyFields'
import { DRAWER_WIDTH } from '../../../../../../constants'

import { MenuIconSelect } from './MenuIconSelect'

const MenuIconSelectStory: Meta<typeof MenuIconSelect> = {
  ...simpleComponentConfig,
  component: MenuIconSelect,
  title:
    'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/JourneyAppearance/Menu/MenuIconSelect'
}

type Story = StoryObj<typeof MenuIconSelect> & { journey?: Journey }

const Template: Story = {
  render: ({ ...args }) => (
    <MockedProvider>
      <JourneyProvider value={{ journey: args.journey }}>
        <Box sx={{ width: DRAWER_WIDTH }}>
          <MenuIconSelect />
        </Box>
      </JourneyProvider>
    </MockedProvider>
  )
}

export const Default: Story = { ...Template }

export const Filled: Story = {
  ...Template,
  args: {
    journey: {
      ...defaultJourney,
      menuButtonIcon: JourneyMenuButtonIcon.home4
    }
  }
}

export default MenuIconSelectStory
