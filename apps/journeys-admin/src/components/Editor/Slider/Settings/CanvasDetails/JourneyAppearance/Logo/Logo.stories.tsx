import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/nextjs'
import { ComponentPropsWithoutRef } from 'react'
import { screen, userEvent } from 'storybook/test'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { DRAWER_WIDTH } from '../../../../../constants'

import { Logo } from '.'

const Demo: Meta<typeof Logo> = {
  ...simpleComponentConfig,
  component: Logo,
  title:
    'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/JourneyAppearance/Logo'
}

const Template: StoryObj<ComponentPropsWithoutRef<typeof Logo>> = {
  render: (args) => (
    <MockedProvider>
      <JourneyProvider value={{ journey: defaultJourney }}>
        <EditorProvider>
          <Box sx={{ width: DRAWER_WIDTH }}>
            <Logo />
          </Box>
        </EditorProvider>
      </JourneyProvider>
    </MockedProvider>
  )
}

export const Default = {
  ...Template
}

export const Open = {
  ...Template,
  play: async () => {
    await userEvent.click(screen.getByRole('button', { name: 'Logo' }))
  }
}

export default Demo
