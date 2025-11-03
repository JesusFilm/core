import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/nextjs'
import { screen, userEvent } from 'storybook/test'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { DRAWER_WIDTH } from '../../../../../constants'

import { DisplayTitle } from '.'

const DisplayTitleStory: Meta<typeof DisplayTitle> = {
  ...simpleComponentConfig,
  component: DisplayTitle,
  title:
    'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/JourneyAppearance/DisplayTitle'
}

const Template: StoryObj<typeof DisplayTitle> = {
  render: ({ ...args }) => (
    <MockedProvider>
      <JourneyProvider value={{ journey: args.journey }}>
        <EditorProvider>
          <Box sx={{ width: DRAWER_WIDTH }}>
            <DisplayTitle />
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
    const button = screen.getByRole('button', { name: 'Display Title' })
    await userEvent.click(button)
  }
}

export const Filled = {
  ...Template,
  args: {
    journey: {
      ...defaultJourney,
      displayTitle: 'Storybook display title'
    }
  },
  play: async () => {
    const button = screen.getByRole('button', { name: 'Display Title' })
    await userEvent.click(button)
  }
}

export default DisplayTitleStory
