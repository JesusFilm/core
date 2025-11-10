import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/nextjs'
import { screen, userEvent } from 'storybook/test'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { JourneyMenuButtonIcon } from '../../../../../../../../__generated__/globalTypes'
import { DRAWER_WIDTH } from '../../../../../constants'

import { Menu } from './Menu'
import { mockMenuStep } from './MenuActionButton/data'

const MenuStory: Meta<typeof Menu> = {
  ...simpleComponentConfig,
  component: Menu,
  title:
    'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/JourneyAppearance/Menu'
}

type Story = StoryObj<typeof Menu>

const Template: Story = {
  render: ({ ...args }) => (
    <MockedProvider>
      <JourneyProvider value={{ journey: args.journey }}>
        <EditorProvider>
          <Box sx={{ width: DRAWER_WIDTH }}>
            <Menu />
          </Box>
        </EditorProvider>
      </JourneyProvider>
    </MockedProvider>
  )
}

export const Default = { ...Template }

export const Open = {
  ...Template,
  play: async () => {
    await userEvent.click(screen.getByRole('button', { name: 'Menu' }))
  }
}

export const Filled = {
  ...Template,
  args: {
    journey: {
      ...defaultJourney,
      menuButtonIcon: JourneyMenuButtonIcon.home4,
      mockMenuStepBlock: mockMenuStep
    }
  },
  play: async () => {
    await userEvent.click(screen.getByRole('button', { name: 'Menu' }))
  }
}

export default MenuStory
