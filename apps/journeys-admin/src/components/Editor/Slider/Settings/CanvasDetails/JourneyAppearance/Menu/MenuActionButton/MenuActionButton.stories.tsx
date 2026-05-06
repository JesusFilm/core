import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/nextjs'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { JourneyFields as Journey } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { DRAWER_WIDTH } from '../../../../../../constants'

import { mockMenuStep } from './data'

import { MenuActionButton } from '.'

const MenuActionButtonStory: Meta<typeof MenuActionButton> = {
  ...simpleComponentConfig,
  component: MenuActionButton,
  title:
    'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/JourneyAppearance/Menu/MenuActionButton'
}

type Story = StoryObj<typeof MenuActionButton> & { journey?: Journey }

const Template: Story = {
  render: ({ journey }) => (
    <MockedProvider>
      <JourneyProvider value={{ journey }}>
        <EditorProvider>
          <Box sx={{ width: DRAWER_WIDTH }}>
            <MenuActionButton />
          </Box>
        </EditorProvider>
      </JourneyProvider>
    </MockedProvider>
  )
}

export const Default: Story = { ...Template }

export const Filled: Story = {
  ...Template,
  args: {
    journey: {
      foo: 'bar',
      ...defaultJourney,
      menuStepBlock: mockMenuStep
    }
  }
}
export default MenuActionButtonStory
